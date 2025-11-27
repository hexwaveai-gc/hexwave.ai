import * as Ably from "ably";
import type { ProcessStatusMessage } from "./types";

// Singleton REST client for server-side operations
let ablyRestClient: Ably.Rest | null = null;

/**
 * Get the Ably REST client for server-side operations
 * Uses singleton pattern to reuse connection
 */
export function getAblyRestClient(): Ably.Rest {
  if (!process.env.ABLY_API_KEY) {
    throw new Error("ABLY_API_KEY environment variable is not set");
  }

  if (!ablyRestClient) {
    ablyRestClient = new Ably.Rest({
      key: process.env.ABLY_API_KEY,
    });
  }

  return ablyRestClient;
}

/**
 * Publish a process status update to the corresponding Ably channel
 * @param processId - The unique process identifier
 * @param message - The status message to publish
 */
export async function publishProcessStatus(
  processId: string,
  message: Omit<ProcessStatusMessage, "processId" | "timestamp">
): Promise<void> {
  try {
    const client = getAblyRestClient();
    const channelName = `process:${processId}`;
    const channel = client.channels.get(channelName);

    const fullMessage: ProcessStatusMessage = {
      ...message,
      processId,
      timestamp: Date.now(),
    };

    await channel.publish("status-update", fullMessage);
  } catch (error) {
    // Log error but don't throw - Ably publishing should not break the main flow
    console.error("[Ably] Failed to publish process status:", error);
    throw error;
  }
}

/**
 * Generate an Ably token for a client with subscribe-only capabilities
 * @param userId - The user ID to associate with the token
 * @returns Token request object for client authentication
 */
export async function generateAblyTokenRequest(
  userId: string
): Promise<Ably.TokenRequest> {
  const client = getAblyRestClient();

  const tokenParams: Ably.TokenParams = {
    clientId: userId,
    capability: {
      // Allow subscribing to any process channel
      "process:*": ["subscribe"],
    },
  };

  const tokenRequest = await client.auth.createTokenRequest(tokenParams);
  return tokenRequest;
}
