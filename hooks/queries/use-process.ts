/**
 * Process Status Query Hooks
 *
 * Combines TanStack Query with Ably real-time subscriptions for optimal
 * process status tracking. TanStack Query handles:
 * - Initial data fetching on mount
 * - Caching to avoid re-fetching completed processes
 * - State recovery after page refresh
 *
 * Ably handles:
 * - Real-time status updates
 * - Instant completion notifications
 */

import { useEffect, useCallback, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import type Ably from "ably";
import { getProcessChannel } from "@/lib/ably/client";
import type { ProcessStatusMessage } from "@/lib/ably/server";
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
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const callbacksRef = useRef({ onStatusChange, onComplete, onError });

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = { onStatusChange, onComplete, onError };
  }, [onStatusChange, onComplete, onError]);

  // TanStack Query for initial data and caching
  const query = useQuery({
    ...processQueryOptions(processId),
    // Enable polling only if Ably is disabled
    refetchInterval: enablePolling && !enableRealtime ? pollingInterval : false,
  });

  // Handle Ably message
  const handleAblyMessage = useCallback(
    (message: Ably.Message) => {
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
        callbacksRef.current.onComplete?.(messageData.data);
      }

      if (messageData.status === "failed" && messageData.error) {
        callbacksRef.current.onError?.(messageData.error);
      }
    },
    [queryClient]
  );

  // Setup Ably subscription
  useEffect(() => {
    if (!processId || !enableRealtime) return;

    // Check if process is already completed - no need to subscribe
    const cachedData = queryClient.getQueryData<ProcessData>(
      processKeys.detail(processId)
    );
    if (cachedData?.status === "completed" || cachedData?.status === "failed") {
      return;
    }

    try {
      const channel = getProcessChannel(processId);
      channelRef.current = channel;

      channel.subscribe("status-update", handleAblyMessage);
    } catch (error) {
      console.error("[useProcessStatusQuery] Failed to subscribe:", error);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current.detach();
        channelRef.current = null;
      }
    };
  }, [processId, enableRealtime, handleAblyMessage, queryClient]);

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
  data?: Record<string, unknown>;
}

interface StartProcessResponse {
  processId: string;
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
  const queryClient = useQueryClient();

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

