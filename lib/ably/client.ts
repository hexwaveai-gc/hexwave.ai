"use client";

import Ably from "ably";

// Singleton Realtime client for client-side operations
let ablyRealtimeClient: Ably.Realtime | null = null;

/**
 * Token authentication callback for Ably client
 * Fetches a new token from our API endpoint
 */
async function authCallback(
  tokenParams: Ably.TokenParams,
  callback: (
    error: Ably.ErrorInfo | string | null,
    tokenRequestOrDetails: Ably.TokenDetails | Ably.TokenRequest | string | null
  ) => void
) {
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
      error instanceof Error ? error.message : "Failed to authenticate",
      null
    );
  }
}

/**
 * Get the Ably Realtime client for frontend operations
 * Uses singleton pattern and token authentication
 */
export function getAblyRealtimeClient(): Ably.Realtime {
  if (typeof window === "undefined") {
    throw new Error("Ably Realtime client can only be used on the client side");
  }

  if (!ablyRealtimeClient) {
    ablyRealtimeClient = new Ably.Realtime({
      authCallback,
      // Auto-connect when client is created
      autoConnect: true,
      // Recover connection on page refresh within 2 minutes
      recover: (lastConnectionDetails, cb) => {
        cb(true);
      },
    });
  }

  return ablyRealtimeClient;
}

/**
 * Close the Ably connection and clean up
 * Call this when the user logs out or the app is unmounting
 */
export function closeAblyConnection(): void {
  if (ablyRealtimeClient) {
    ablyRealtimeClient.close();
    ablyRealtimeClient = null;
  }
}

/**
 * Get a channel for a specific process ID
 * @param processId - The process ID to subscribe to
 */
export function getProcessChannel(processId: string): Ably.RealtimeChannel {
  const client = getAblyRealtimeClient();
  return client.channels.get(`process:${processId}`);
}
