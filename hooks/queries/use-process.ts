/**
 * Process Status Query Hooks
 *
 * Combines TanStack Query with Ably real-time subscriptions for optimal
 * process status tracking. TanStack Query handles:
 * - Initial data fetching on mount
 * - Caching to avoid re-fetching completed processes
 * - State recovery after page refresh
 *
 * Ably handles (via singleton manager):
 * - On-demand connection (only when subscribing)
 * - Real-time status updates
 * - Instant completion notifications
 * - Auto-disconnect when all processes complete
 */

import { useEffect, useCallback, useRef, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import {
  subscribeToProcess,
  addConnectionListener,
  isConnected as checkIsConnected,
} from "@/lib/ably/client";
import type { ProcessStatusMessage } from "@/lib/ably/types";
import { processKeys } from "@/lib/query";
import { STALE_TIME_INFINITE } from "@/constants/query";

// =============================================================================
// Types
// =============================================================================

export type ProcessStatus = "idle" | "processing" | "completed" | "failed";

export interface ProcessData {
  processId: string;
  status: ProcessStatus;
  data: Record<string, unknown> | null;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UseProcessStatusQueryOptions {
  /** Enable Ably real-time subscription (default: true) */
  enableRealtime?: boolean;
  /** Enable polling as fallback (default: false) */
  enablePolling?: boolean;
  /** Polling interval in ms (default: 5000) */
  pollingInterval?: number;
  /** Callback when status changes */
  onStatusChange?: (status: ProcessStatus, data?: Record<string, unknown>) => void;
  /** Callback when process completes */
  onComplete?: (data: Record<string, unknown>) => void;
  /** Callback when process fails */
  onError?: (error: string) => void;
}

// =============================================================================
// API Functions
// =============================================================================

async function fetchProcessStatus(processId: string): Promise<ProcessData> {
  const res = await fetch(`/api/process/${processId}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Process not found");
    }
    throw new Error("Failed to fetch process status");
  }
  return res.json();
}

// =============================================================================
// Query Options
// =============================================================================

export function processQueryOptions(processId: string | null) {
  return queryOptions({
    queryKey: processKeys.detail(processId ?? ""),
    queryFn: () => fetchProcessStatus(processId!),
    enabled: !!processId,
    // Don't auto-refetch - Ably handles real-time updates
    staleTime: STALE_TIME_INFINITE,
    // Keep completed processes in cache
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// =============================================================================
// Main Hook: useProcessStatusQuery
// =============================================================================

/**
 * Combined TanStack Query + Ably hook for process status tracking
 *
 * Features:
 * - On-demand Ably connection (no connection until you have a processId)
 * - Auto-disconnect when process completes/fails
 * - Automatic cache sync with real-time updates
 *
 * @param processId - The process ID to track
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const { status, data, isLoading } = useProcessStatusQuery(processId, {
 *   onComplete: (data) => toast.success("Done!"),
 *   onError: (error) => toast.error(error),
 * });
 * ```
 */
export function useProcessStatusQuery(
  processId: string | null,
  options: UseProcessStatusQueryOptions = {}
) {
  const {
    enableRealtime = true,
    enablePolling = false,
    pollingInterval = 5000,
    onStatusChange,
    onComplete,
    onError,
  } = options;

  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const callbacksRef = useRef({ onStatusChange, onComplete, onError });

  // Track if we've received a terminal status
  const hasCompletedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = { onStatusChange, onComplete, onError };
  }, [onStatusChange, onComplete, onError]);

  // Listen to connection state changes
  useEffect(() => {
    setIsConnected(checkIsConnected());
    const removeListener = addConnectionListener((state) => {
      setIsConnected(state === "connected");
    });
    return removeListener;
  }, []);

  // TanStack Query for initial data and caching
  const query = useQuery({
    ...processQueryOptions(processId),
    // Enable polling only if Ably is disabled or not connected
    refetchInterval:
      enablePolling && (!enableRealtime || !isConnected) ? pollingInterval : false,
  });

  // Setup Ably subscription (on-demand connection)
  useEffect(() => {
    if (!processId || !enableRealtime) return;

    // Reset completion flag when processId changes
    hasCompletedRef.current = false;

    // Check if process is already completed - no need to subscribe
    const cachedData = queryClient.getQueryData<ProcessData>(
      processKeys.detail(processId)
    );
    if (cachedData?.status === "completed" || cachedData?.status === "failed") {
      hasCompletedRef.current = true;
      return;
    }

    let isCancelled = false;

    // Subscribe asynchronously (this triggers connection on first subscription)
    subscribeToProcess(processId, (message) => {
      if (isCancelled || hasCompletedRef.current) return;

      const messageData = message.data as ProcessStatusMessage;

      // Update query cache with real-time data
      queryClient.setQueryData<ProcessData>(
        processKeys.detail(messageData.processId),
        (old) => ({
          processId: messageData.processId,
          status: messageData.status,
          data: messageData.data || old?.data || null,
          error: messageData.error,
          createdAt: old?.createdAt,
          updatedAt: new Date().toISOString(),
        })
      );

      // Trigger callbacks
      callbacksRef.current.onStatusChange?.(messageData.status, messageData.data);

      if (messageData.status === "completed" && messageData.data) {
        hasCompletedRef.current = true;
        callbacksRef.current.onComplete?.(messageData.data);
        // Auto-unsubscribe on completion
        setTimeout(() => {
          unsubscribeRef.current?.();
          unsubscribeRef.current = null;
        }, 0);
      }

      if (messageData.status === "failed" && messageData.error) {
        hasCompletedRef.current = true;
        callbacksRef.current.onError?.(messageData.error);
        // Auto-unsubscribe on failure
        setTimeout(() => {
          unsubscribeRef.current?.();
          unsubscribeRef.current = null;
        }, 0);
      }
    })
      .then((unsubscribe) => {
        if (isCancelled) {
          unsubscribe();
          return;
        }
        unsubscribeRef.current = unsubscribe;
      })
      .catch((error) => {
        console.error("[useProcessStatusQuery] Failed to subscribe:", error);
      });

    // Cleanup on unmount or processId change
    return () => {
      isCancelled = true;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [processId, enableRealtime, queryClient]);

  // Derived status
  const status: ProcessStatus = query.data?.status ?? "idle";
  const isLoading = query.isLoading || status === "processing";

  return {
    // Process state
    status,
    data: query.data?.data ?? null,
    error: query.data?.error ?? (query.error?.message || null),
    processId,
    isLoading,

    // Query state
    isInitialLoading: query.isLoading,
    isFetching: query.isFetching,
    isStale: query.isStale,

    // Connection state
    isConnected,

    // Actions
    refetch: query.refetch,
  };
}

// =============================================================================
// Mutation Hooks
// =============================================================================

interface StartProcessInput {
  toolName: string;
  category?: string;
  creditsToDeduct?: number;
  data?: Record<string, unknown>;
}

interface StartProcessResponse {
  processId: string;
  creditsUsed?: number;
}

/**
 * Start a new demo process
 */
export function useStartProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StartProcessInput): Promise<StartProcessResponse> => {
      const res = await fetch("/api/examples/ably/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to start process");
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Pre-populate cache with initial processing state
      queryClient.setQueryData<ProcessData>(
        processKeys.detail(data.processId),
        {
          processId: data.processId,
          status: "processing",
          data: null,
          createdAt: new Date().toISOString(),
        }
      );
    },
  });
}

/**
 * Simulate webhook completion (for demo purposes)
 */
export function useSimulateWebhook() {
  return useMutation({
    mutationFn: async ({
      processId,
      success = true,
      delay = 0,
    }: {
      processId: string;
      success?: boolean;
      delay?: number;
    }) => {
      const res = await fetch("/api/examples/ably/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processId, success, delay }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to simulate webhook");
      }

      return res.json();
    },
    // We don't need to update cache here - Ably will push the update
  });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Invalidate and refetch a process status
 */
export function useInvalidateProcess() {
  const queryClient = useQueryClient();

  return useCallback(
    (processId: string) => {
      queryClient.invalidateQueries({
        queryKey: processKeys.detail(processId),
      });
    },
    [queryClient]
  );
}

/**
 * Clear a process from cache
 */
export function useClearProcessCache() {
  const queryClient = useQueryClient();

  return useCallback(
    (processId: string) => {
      queryClient.removeQueries({
        queryKey: processKeys.detail(processId),
      });
    },
    [queryClient]
  );
}
