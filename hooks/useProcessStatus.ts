"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type Ably from "ably";
import { getProcessChannel } from "@/lib/ably/client";
import type { ProcessStatusMessage } from "@/lib/ably/types";

// Process status types
export type ProcessStatus = "idle" | "processing" | "completed" | "failed";

export interface ProcessStatusState {
  status: ProcessStatus;
  data: Record<string, unknown> | null;
  error: string | null;
  isLoading: boolean;
  timestamp: number | null;
}

export interface UseProcessStatusOptions {
  // Whether to auto-subscribe when processId is provided
  autoSubscribe?: boolean;
  // Callback when status changes
  onStatusChange?: (status: ProcessStatus, data?: Record<string, unknown>) => void;
  // Callback when process completes
  onComplete?: (data: Record<string, unknown>) => void;
  // Callback when process fails
  onError?: (error: string) => void;
}

export interface UseProcessStatusReturn extends ProcessStatusState {
  // Subscribe to a process (if not auto-subscribing)
  subscribe: (processId: string) => void;
  // Unsubscribe from current process
  unsubscribe: () => void;
  // Reset state to initial values
  reset: () => void;
  // Current subscribed process ID
  processId: string | null;
  // Whether currently subscribed
  isSubscribed: boolean;
}

const initialState: ProcessStatusState = {
  status: "idle",
  data: null,
  error: null,
  isLoading: false,
  timestamp: null,
};

/**
 * Hook to subscribe to real-time process status updates via Ably
 *
 * @param processId - Optional process ID to auto-subscribe to
 * @param options - Configuration options
 * @returns Process status state and control functions
 *
 * @example
 * // Basic usage with auto-subscribe
 * const { status, data, error, isLoading } = useProcessStatus(processId);
 *
 * @example
 * // With callbacks
 * const { status } = useProcessStatus(processId, {
 *   onComplete: (data) => console.log('Completed!', data),
 *   onError: (error) => console.error('Failed:', error),
 * });
 *
 * @example
 * // Manual subscription control
 * const { subscribe, unsubscribe, status } = useProcessStatus(null, { autoSubscribe: false });
 * // Later: subscribe('some-process-id');
 */
export function useProcessStatus(
  processId?: string | null,
  options: UseProcessStatusOptions = {}
): UseProcessStatusReturn {
  const { autoSubscribe = true, onStatusChange, onComplete, onError } = options;

  const [state, setState] = useState<ProcessStatusState>(initialState);
  const [currentProcessId, setCurrentProcessId] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Store channel reference for cleanup
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  // Handle incoming messages
  const handleMessage = useCallback(
    (message: Ably.Message) => {
      const data = message.data as ProcessStatusMessage;

      setState({
        status: data.status,
        data: data.data || null,
        error: data.error || null,
        isLoading: data.status === "processing",
        timestamp: data.timestamp,
      });

      // Trigger callbacks
      onStatusChange?.(data.status, data.data);

      if (data.status === "completed" && data.data) {
        onComplete?.(data.data);
      }

      if (data.status === "failed" && data.error) {
        onError?.(data.error);
      }
    },
    [onStatusChange, onComplete, onError]
  );

  // Subscribe to a process channel
  const subscribe = useCallback(
    (id: string) => {
      // Unsubscribe from previous channel if any
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current.detach();
      }

      try {
        const channel = getProcessChannel(id);
        channelRef.current = channel;

        // Set loading state when subscribing
        setState((prev) => ({
          ...prev,
          status: "processing",
          isLoading: true,
        }));

        // Subscribe to status updates
        channel.subscribe("status-update", handleMessage);

        setCurrentProcessId(id);
        setIsSubscribed(true);
      } catch (error) {
        console.error("[useProcessStatus] Failed to subscribe:", error);
        setState((prev) => ({
          ...prev,
          status: "failed",
          error: "Failed to subscribe to process updates",
          isLoading: false,
        }));
      }
    },
    [handleMessage]
  );

  // Unsubscribe from current channel
  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current.detach();
      channelRef.current = null;
    }
    setCurrentProcessId(null);
    setIsSubscribed(false);
  }, []);

  // Reset state to initial values
  const reset = useCallback(() => {
    unsubscribe();
    setState(initialState);
  }, [unsubscribe]);

  // Auto-subscribe when processId changes
  useEffect(() => {
    if (autoSubscribe && processId) {
      subscribe(processId);
    }

    // Cleanup on unmount or when processId changes
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current.detach();
      }
    };
  }, [processId, autoSubscribe, subscribe]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    reset,
    processId: currentProcessId,
    isSubscribed,
  };
}

