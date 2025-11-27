"use client";

/**
 * Singleton Ably Manager
 *
 * Manages a single Ably Realtime connection with reference counting.
 * Connection is established only when the first subscription is created,
 * and closed when the last subscription is released.
 *
 * This approach:
 * - Zero connections for users just browsing
 * - Lazy initialization on first subscription
 * - Automatic cleanup when all processes complete
 */

// Type-only imports (erased at compile time)
type AblyRealtime = import("ably").Realtime;
type AblyRealtimeChannel = import("ably").RealtimeChannel;
type AblyMessage = import("ably").Message;

export type { AblyMessage };

// =============================================================================
// Singleton State (module-level)
// =============================================================================

let ablyClient: AblyRealtime | null = null;
let subscriptionCount = 0;
let isConnecting = false;
let connectionPromise: Promise<void> | null = null;

// Track active channels for cleanup
const activeChannels = new Map<string, AblyRealtimeChannel>();

// Connection state listeners
type ConnectionStateListener = (state: "connected" | "disconnected" | "connecting" | "failed") => void;
const connectionListeners = new Set<ConnectionStateListener>();

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Fetch auth token from our API endpoint
 */
async function fetchAuthToken(): Promise<unknown> {
  const response = await fetch("/api/ably/token");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get Ably token");
  }

  return response.json();
}

/**
 * Notify all connection state listeners
 */
function notifyConnectionState(state: "connected" | "disconnected" | "connecting" | "failed") {
  connectionListeners.forEach((listener) => listener(state));
}

/**
 * Create and configure the Ably client
 */
async function createAblyClient(): Promise<AblyRealtime> {
  const Ably = await import("ably");

  const client = new Ably.Realtime({
    authCallback: async (_tokenParams, callback) => {
      try {
        const tokenRequest = await fetchAuthToken();
        callback(null, tokenRequest as Parameters<typeof callback>[1]);
      } catch (error) {
        callback(error instanceof Error ? error.message : "Auth failed", null);
      }
    },
    autoConnect: false, // We control when to connect
  });

  // Setup connection state handlers
  client.connection.on("connected", () => {
    isConnecting = false;
    notifyConnectionState("connected");
  });

  client.connection.on("disconnected", () => {
    notifyConnectionState("disconnected");
  });

  client.connection.on("suspended", () => {
    notifyConnectionState("disconnected");
  });

  client.connection.on("failed", () => {
    isConnecting = false;
    notifyConnectionState("failed");
  });

  client.connection.on("connecting", () => {
    notifyConnectionState("connecting");
  });

  return client;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Ensure an Ably connection is established.
 * Creates client lazily on first call and connects.
 *
 * @returns Promise that resolves when connected
 */
export async function ensureConnected(): Promise<void> {
  // SSR guard
  if (typeof window === "undefined") {
    return;
  }

  // Already connected
  if (ablyClient?.connection.state === "connected") {
    return;
  }

  // Connection in progress - wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Create connection promise
  connectionPromise = (async () => {
    try {
      isConnecting = true;
      notifyConnectionState("connecting");

      // Create client if needed
      if (!ablyClient) {
        ablyClient = await createAblyClient();
      }

      // Connect if not already connected/connecting
      if (ablyClient.connection.state !== "connected" && ablyClient.connection.state !== "connecting") {
        ablyClient.connect();
      }

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 10000);

        const onConnected = () => {
          clearTimeout(timeout);
          ablyClient?.connection.off("connected", onConnected);
          ablyClient?.connection.off("failed", onFailed);
          resolve();
        };

        const onFailed = () => {
          clearTimeout(timeout);
          ablyClient?.connection.off("connected", onConnected);
          ablyClient?.connection.off("failed", onFailed);
          reject(new Error("Connection failed"));
        };

        // Check if already connected
        if (ablyClient?.connection.state === "connected") {
          clearTimeout(timeout);
          resolve();
          return;
        }

        ablyClient?.connection.on("connected", onConnected);
        ablyClient?.connection.on("failed", onFailed);
      });
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

/**
 * Subscribe to a process channel
 *
 * @param processId - The process ID to subscribe to
 * @param onMessage - Callback for incoming messages
 * @returns Unsubscribe function
 */
export async function subscribeToProcess(
  processId: string,
  onMessage: (message: AblyMessage) => void
): Promise<() => void> {
  // SSR guard
  if (typeof window === "undefined") {
    return () => {};
  }

  // Increment count and ensure connected
  subscriptionCount++;

  try {
    await ensureConnected();
  } catch (error) {
    subscriptionCount--;
    console.error("[Ably] Failed to connect:", error);
    return () => {};
  }

  if (!ablyClient) {
    subscriptionCount--;
    return () => {};
  }

  const channelName = `process:${processId}`;
  let channel = activeChannels.get(channelName);

  if (!channel) {
    channel = ablyClient.channels.get(channelName);
    activeChannels.set(channelName, channel);
  }

  // Subscribe to status-update events
  const eventName = "status-update";
  channel.subscribe(eventName, onMessage);

  // Return unsubscribe function
  return () => {
    if (channel) {
      channel.unsubscribe(eventName, onMessage);
      channel.detach();
      activeChannels.delete(channelName);
    }

    // Decrement count and close connection if no more subscriptions
    subscriptionCount--;
    if (subscriptionCount <= 0) {
      subscriptionCount = 0;
      closeConnection();
    }
  };
}

/**
 * Close the Ably connection and cleanup
 */
export function closeConnection(): void {
  if (ablyClient) {
    // Detach all channels
    activeChannels.forEach((channel) => {
      try {
        channel.detach();
      } catch {
        // Ignore detach errors during cleanup
      }
    });
    activeChannels.clear();

    // Close connection
    ablyClient.close();
    ablyClient = null;
    notifyConnectionState("disconnected");
  }

  subscriptionCount = 0;
  isConnecting = false;
  connectionPromise = null;
}

/**
 * Get current connection state
 */
export function getConnectionState(): "connected" | "disconnected" | "connecting" | "failed" {
  if (!ablyClient) return "disconnected";
  if (isConnecting) return "connecting";

  const state = ablyClient.connection.state;
  if (state === "connected") return "connected";
  if (state === "connecting") return "connecting";
  if (state === "failed") return "failed";
  return "disconnected";
}

/**
 * Check if currently connected
 */
export function isConnected(): boolean {
  return ablyClient?.connection.state === "connected";
}

/**
 * Add a connection state listener
 */
export function addConnectionListener(listener: ConnectionStateListener): () => void {
  connectionListeners.add(listener);
  return () => connectionListeners.delete(listener);
}

/**
 * Get current subscription count (for debugging)
 */
export function getSubscriptionCount(): number {
  return subscriptionCount;
}

