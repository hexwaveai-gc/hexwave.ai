"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useAuth } from "@clerk/nextjs";
import type { ProcessStatusMessage } from "./types";

// Type-only imports (erased at compile time, no runtime bundling)
type AblyRealtime = import("ably").Realtime;
type AblyMessage = import("ably").Message;
type AblyRealtimeChannel = import("ably").RealtimeChannel;

// =============================================================================
// Context Types
// =============================================================================

interface AblyContextValue {
  /** Whether the Ably connection is established */
  isConnected: boolean;
  /** Whether Ably is currently initializing */
  isInitializing: boolean;
  /**
   * Subscribe to a process channel for real-time updates
   * @param processId - The process ID to subscribe to
   * @param onMessage - Callback when a message is received
   * @returns Unsubscribe function
   */
  subscribeToProcess: (
    processId: string,
    onMessage: (message: AblyMessage) => void
  ) => () => void;
}

const AblyContext = createContext<AblyContextValue | null>(null);

// =============================================================================
// AblyProvider Component
// =============================================================================

interface AblyProviderProps {
  children: React.ReactNode;
}

/**
 * AblyProvider manages the Ably Realtime connection lifecycle.
 *
 * Features:
 * - Dynamic import of Ably (prevents SSR bundling issues)
 * - Connection tied to Clerk authentication
 * - Automatic cleanup on sign out
 * - Connection recovery on page refresh
 */
export function AblyProvider({ children }: AblyProviderProps) {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const ablyRef = useRef<AblyRealtime | null>(null);
  const channelsRef = useRef<Map<string, AblyRealtimeChannel>>(new Map());

  // Initialize Ably connection when user signs in
  useEffect(() => {
    // SSR guard
    if (typeof window === "undefined") return;

    // Wait for auth to load
    if (!isLoaded) return;

    // Clean up if user signs out
    if (!isSignedIn || !userId) {
      if (ablyRef.current) {
        ablyRef.current.close();
        ablyRef.current = null;
        channelsRef.current.clear();
        setIsConnected(false);
      }
      return;
    }

    // Don't reinitialize if already connected
    if (ablyRef.current) return;

    const initializeAbly = async () => {
      setIsInitializing(true);

      try {
        // Dynamic import prevents ably-node.js from being bundled during SSR
        const Ably = await import("ably");

        const client = new Ably.Realtime({
          authCallback: async (tokenParams, callback) => {
            try {
              const response = await fetch("/api/ably/token");

              if (!response.ok) {
                const error = await response.json();
                callback(error.error || "Failed to get token", null);
                return;
              }

              const tokenRequest = await response.json();
              callback(null, tokenRequest);
            } catch (error) {
              callback(
                error instanceof Error ? error.message : "Auth failed",
                null
              );
            }
          },
          autoConnect: true,
          // Recover connection on page refresh (2 minute window)
          recover: (lastConnectionDetails, cb) => {
            cb(true);
          },
        });

        // Connection state handlers
        client.connection.on("connected", () => {
          setIsConnected(true);
          setIsInitializing(false);
        });

        client.connection.on("disconnected", () => {
          setIsConnected(false);
        });

        client.connection.on("suspended", () => {
          setIsConnected(false);
        });

        client.connection.on("failed", () => {
          setIsConnected(false);
          setIsInitializing(false);
        });

        ablyRef.current = client;
      } catch (error) {
        console.error("[AblyProvider] Failed to initialize:", error);
        setIsInitializing(false);
      }
    };

    initializeAbly();

    // Cleanup on unmount
    return () => {
      if (ablyRef.current) {
        ablyRef.current.close();
        ablyRef.current = null;
        channelsRef.current.clear();
        setIsConnected(false);
      }
    };
  }, [userId, isSignedIn, isLoaded]);

  // Subscribe to a process channel
  const subscribeToProcess = useCallback(
    (processId: string, onMessage: (message: AblyMessage) => void) => {
      // SSR guard
      if (typeof window === "undefined") {
        return () => {};
      }

      // Return no-op if not connected
      if (!ablyRef.current) {
        return () => {};
      }

      const channelName = `process:${processId}`;
      let channel = channelsRef.current.get(channelName);

      if (!channel) {
        channel = ablyRef.current.channels.get(channelName);
        channelsRef.current.set(channelName, channel);
      }

      // Subscribe to status-update events
      const eventName = "status-update";
      channel.subscribe(eventName, onMessage);

      // Return unsubscribe function
      return () => {
        if (channel) {
          channel.unsubscribe(eventName, onMessage);
          // Detach channel to clean up resources
          channel.detach();
          channelsRef.current.delete(channelName);
        }
      };
    },
    []
  );

  const value = useMemo<AblyContextValue>(
    () => ({
      isConnected,
      isInitializing,
      subscribeToProcess,
    }),
    [isConnected, isInitializing, subscribeToProcess]
  );

  return <AblyContext.Provider value={value}>{children}</AblyContext.Provider>;
}


/**
 * Hook to access the Ably context
 * @throws Error if used outside AblyProvider
 */
export function useAbly(): AblyContextValue {
  const context = useContext(AblyContext);

  if (!context) {
    throw new Error("useAbly must be used within an AblyProvider");
  }

  return context;
}

/**
 * Hook to subscribe to process status updates
 *
 * @param processId - The process ID to subscribe to (null to disable)
 * @param callbacks - Callback functions for different events
 * @returns Connection state
 *
 * @example
 * ```tsx
 * useProcessSubscription(processId, {
 *   onStatusChange: (status, data) => console.log(status),
 *   onComplete: (data) => toast.success("Done!"),
 *   onError: (error) => toast.error(error),
 * });
 * ```
 */
export function useProcessSubscription(
  processId: string | null,
  callbacks: {
    onStatusChange?: (
      status: ProcessStatusMessage["status"],
      data?: Record<string, unknown>
    ) => void;
    onComplete?: (data: Record<string, unknown>) => void;
    onError?: (error: string) => void;
  } = {}
): { isConnected: boolean } {
  const { subscribeToProcess, isConnected } = useAbly();

  // Keep callbacks ref stable to avoid re-subscriptions
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    // Skip if no processId or not connected
    if (!processId || !isConnected) return;

    const unsubscribe = subscribeToProcess(processId, (message) => {
      const data = message.data as ProcessStatusMessage;

      // Trigger status change callback
      callbacksRef.current.onStatusChange?.(data.status, data.data);

      // Trigger completion callback
      if (data.status === "completed" && data.data) {
        callbacksRef.current.onComplete?.(data.data);
      }

      // Trigger error callback
      if (data.status === "failed" && data.error) {
        callbacksRef.current.onError?.(data.error);
      }
    });

    return unsubscribe;
  }, [processId, isConnected, subscribeToProcess]);

  return { isConnected };
}

