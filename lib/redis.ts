import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client singleton
 *
 * Uses HTTP-based connection which is ideal for serverless environments.
 * Automatically reads credentials from environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 *
 * Best Practices Applied:
 * - Auto pipelining for batching commands in same event loop tick
 * - Exponential backoff retry for resilience
 * - Singleton pattern to prevent connection proliferation
 * - Read-your-writes consistency for session data
 */

// Singleton pattern to reuse Redis client across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var __redisClient__: Redis | undefined;
}

/**
 * Get the Redis client instance
 * Creates a new client if one doesn't exist, otherwise returns the cached instance
 */
function createRedisClient(): Redis {
  // Check if we already have a client in the global cache
  if (global.__redisClient__) {
    return global.__redisClient__;
  }

  // Validate environment variables
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis credentials. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables."
    );
  }

  // Create new Redis client with optimized settings
  const client = new Redis({
    url,
    token,
    // Enable auto pipelining for better performance
    // Commands issued in the same event loop tick are batched into single HTTP request
    enableAutoPipelining: true,
    // Retry configuration with exponential backoff
    retry: {
      retries: 5,
      backoff: (retryCount) => {
        // Exponential backoff: 50ms, 135ms, 366ms, 997ms, 2716ms
        return Math.exp(retryCount) * 50;
      },
    },
    // Enable read-your-writes consistency (default: true)
    // Guarantees that reads after writes see the written data
    readYourWrites: true,
  });

  // Cache the client globally to survive hot reloads in development
  // In production, this ensures we reuse connections across serverless invocations
  global.__redisClient__ = client;

  return client;
}

// Export the singleton Redis client
export const redis = createRedisClient();

// Export the Redis class for advanced use cases (e.g., creating separate clients)
export { Redis };

