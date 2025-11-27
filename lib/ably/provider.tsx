"use client";

/**
 * Ably Hooks
 *
 * Hooks for subscribing to real-time process updates.
 * Uses singleton Ably manager for on-demand connections.
 *
 * No Provider needed - the singleton manager handles:
 * - Lazy connection on first subscription
 * - Reference counting for auto-disconnect
 * - Cleanup when all processes complete
 */

import { useEffect, useState, useRef, useCallback } from "react";
import {
  subscribeToProcess,
  addConnectionListener,
  isConnected as checkIsConnected,
  type AblyMessage,
} from "./client";
import type { ProcessStatusMessage } from "./types";

// =============================================================================
// useProcessSubscription Hook
// =============================================================================

interface UseProcessSubscriptionOptions {
  /** Callback when status changes */
  onStatusChange?: (
    status: ProcessStatusMessage["status"],
    data?: Record<string, unknown>
  ) => void;
  /** Callback when process completes */
  onComplete?: (data: Record<string, unknown>) => void;
  /** Callback when process fails */
  onError?: (error: string) => void;
  /** Whether to auto-unsubscribe when completed/failed (default: true) */
  autoUnsubscribeOnComplete?: boolean;
}

interface UseProcessSubscriptionResult {
  /** Whether Ably connection is established */
  isConnected: boolean;
  /** Whether currently subscribing */
  isSubscribing: boolean;
}

/**
 * Hook to subscribe to process status updates via Ably
 *
 * @param processId - The process ID to subscribe to (null to disable)
 * @param options - Callback options
 * @returns Connection state
 *
 * @example
 * ```tsx
 * const { isConnected } = useProcessSubscription(processId, {
 *   onStatusChange: (status, data) => console.log(status),
 *   onComplete: (data) => toast.success("Done!"),
 *   onError: (error) => toast.error(error),
 * });
 * ```
 */
export function useProcessSubscription(
  processId: string | null,
  options: UseProcessSubscriptionOptions = {}
): UseProcessSubscriptionResult {
  const {
    onStatusChange,
    onComplete,
    onError,
    autoUnsubscribeOnComplete = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Keep callbacks ref stable to avoid re-subscriptions
  const callbacksRef = useRef({ onStatusChange, onComplete, onError });
  useEffect(() => {
    callbacksRef.current = { onStatusChange, onComplete, onError };
  }, [onStatusChange, onComplete, onError]);

  // Track if we've auto-unsubscribed due to completion
  const hasCompletedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Listen to connection state changes
  useEffect(() => {
    setIsConnected(checkIsConnected());
    const removeListener = addConnectionListener((state) => {
      setIsConnected(state === "connected");
    });
    return removeListener;
  }, []);

  // Subscribe to process channel
  useEffect(() => {
    // Skip if no processId
    if (!processId) {
      hasCompletedRef.current = false;
      return;
    }

    // Skip if already completed and auto-unsubscribed
    if (hasCompletedRef.current && autoUnsubscribeOnComplete) {
      return;
    }

    let isCancelled = false;
    setIsSubscribing(true);

    const handleMessage = (message: AblyMessage) => {
      if (isCancelled) return;

      const data = message.data as ProcessStatusMessage;

      // Trigger status change callback
      callbacksRef.current.onStatusChange?.(data.status, data.data);

      // Handle completion
      if (data.status === "completed" && data.data) {
        callbacksRef.current.onComplete?.(data.data);

        if (autoUnsubscribeOnComplete) {
          hasCompletedRef.current = true;
          // Unsubscribe on next tick to allow state updates
          setTimeout(() => {
            unsubscribeRef.current?.();
            unsubscribeRef.current = null;
          }, 0);
        }
      }

      // Handle failure
      if (data.status === "failed" && data.error) {
        callbacksRef.current.onError?.(data.error);

        if (autoUnsubscribeOnComplete) {
          hasCompletedRef.current = true;
          setTimeout(() => {
            unsubscribeRef.current?.();
            unsubscribeRef.current = null;
          }, 0);
        }
      }
    };

    // Subscribe asynchronously
    subscribeToProcess(processId, handleMessage)
      .then((unsubscribe) => {
        if (isCancelled) {
          unsubscribe();
          return;
        }
        unsubscribeRef.current = unsubscribe;
        setIsSubscribing(false);
      })
      .catch((error) => {
        console.error("[useProcessSubscription] Failed to subscribe:", error);
        setIsSubscribing(false);
      });

    // Cleanup on unmount or processId change
    return () => {
      isCancelled = true;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [processId, autoUnsubscribeOnComplete]);

  return { isConnected, isSubscribing };
}

// =============================================================================
// useAblyConnection Hook (for debugging/status display)
// =============================================================================

/**
 * Hook to monitor Ably connection state
 * Use this when you need to display connection status
 */
export function useAblyConnection(): {
  isConnected: boolean;
} {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(checkIsConnected());
    const removeListener = addConnectionListener((state) => {
      setIsConnected(state === "connected");
    });
    return removeListener;
  }, []);

  return { isConnected };
}
