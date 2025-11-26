import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";
import { RATE_LIMIT_CONFIG, type RateLimitType } from "@/constants/cache";

/**
 * Rate Limiter using Upstash Redis
 *
 * Provides configurable rate limiting for different endpoint types.
 * Uses sliding window algorithm for accurate rate limiting.
// =============================================================================
// Ephemeral Cache for Performance
// =============================================================================

/**
 * In-memory cache to reduce Redis calls
 * Shared across rate limiter instances for efficiency
 * This cache stores rate limit state locally, reducing latency
 */
const ephemeralCache = new Map<string, number>();

// =============================================================================
// Rate Limiter Factory
// =============================================================================

/**
 * Create a rate limiter instance with specified configuration
 * @param type - Type of rate limit (API, GENERATION, AUTH, PUBLIC)
 * @returns Ratelimit instance
 */
function createRateLimiter(type: RateLimitType): Ratelimit {
  const config = RATE_LIMIT_CONFIG[type];

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    analytics: true, // Enable analytics in Upstash dashboard
    prefix: `@hexwave/ratelimit:${type.toLowerCase()}`,
    // Ephemeral cache reduces Redis calls by caching state locally
    // Especially useful in serverless where each request is isolated
    ephemeralCache,
  });
}

// =============================================================================
// Pre-configured Rate Limiters
// =============================================================================

/**
 * Standard API rate limiter
 * Use for general API endpoints
 */
export const apiRateLimiter = createRateLimiter("API");

/**
 * Generation rate limiter (more restrictive)
 * Use for image/video generation endpoints
 */
export const generationRateLimiter = createRateLimiter("GENERATION");

/**
 * Auth rate limiter (very restrictive)
 * Use for authentication endpoints to prevent brute force
 */
export const authRateLimiter = createRateLimiter("AUTH");

/**
 * Public rate limiter (lenient)
 * Use for public/read-only endpoints
 */
export const publicRateLimiter = createRateLimiter("PUBLIC");

// =============================================================================
// Rate Limit Helper Functions
// =============================================================================

/**
 * Rate limit result type
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Maximum requests allowed in the window */
  limit: number;
  /** Remaining requests in the current window */
  remaining: number;
  /** Unix timestamp when the rate limit resets */
  reset: number;

  pending: Promise<unknown>;
}

/**
 * Check rate limit for a given identifier using the specified limiter type
 *
 * @param identifier - Unique identifier for rate limiting (usually user ID or IP)
 * @param type - Type of rate limit to apply
 * @returns Rate limit result
 *
 * @example
 * ```typescript
 * import { waitUntil } from '@vercel/functions';
 *
 * const result = await checkRateLimit("user_123", "GENERATION");
 *
 * // IMPORTANT: Use waitUntil for analytics in serverless
 * waitUntil(result.pending);
 *
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: "Rate limit exceeded" },
 *     { status: 429 }
 *   );
 * }
 * ```
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = "API"
): Promise<RateLimitResult> {
  const limiter = getLimiterByType(type);
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    pending: result.pending,
  };
}

/**
 * Get the appropriate rate limiter by type
 */
function getLimiterByType(type: RateLimitType): Ratelimit {
  switch (type) {
    case "GENERATION":
      return generationRateLimiter;
    case "AUTH":
      return authRateLimiter;
    case "PUBLIC":
      return publicRateLimiter;
    case "API":
    default:
      return apiRateLimiter;
  }
}

/**
 * Create rate limit headers for HTTP response
 * Use these headers to inform clients about their rate limit status
 *
 * @param result - Rate limit result
 * @returns Headers object
 */
export function createRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}

/**
 * Helper to get identifier from request
 * Prioritizes authenticated user ID, falls back to IP address
 *
 * @param userId - Authenticated user ID (if available)
 * @param ip - Client IP address
 * @returns Identifier for rate limiting
 */
export function getRateLimitIdentifier(
  userId: string | null | undefined,
  ip: string | null | undefined
): string {
  if (userId) {
    return `user:${userId}`;
  }

  if (ip) {
    return `ip:${ip}`;
  }

  // Fallback for edge cases
  return `anonymous:${Date.now()}`;
}

// =============================================================================
// Next.js API Route Middleware Helper
// =============================================================================

import { NextResponse } from "next/server";

/**
 * Rate limit middleware result
 */
export interface RateLimitMiddlewareResult {
  /** Response to return if rate limited, null if allowed */
  response: NextResponse | null;
  /** Promise for analytics - use with waitUntil in serverless */
  pending: Promise<unknown>;
  /** Rate limit headers to add to your response */
  headers: Record<string, string>;
}

/**
 * Rate limit middleware for Next.js API routes
 *
 * @param identifier - Unique identifier for rate limiting
 * @param type - Type of rate limit to apply
 * @returns Object with response (null if allowed), pending promise, and headers
 *
 * @example
 * ```typescript
 * import { waitUntil } from '@vercel/functions';
 *
 * export async function POST(request: Request) {
 *   const userId = getUserIdFromAuth(request);
 *   const { response, pending, headers } = await rateLimitMiddleware(userId, "GENERATION");
 *
 *   // IMPORTANT: Always handle the pending promise for analytics
 *   waitUntil(pending);
 *
 *   if (response) {
 *     return response; // Returns 429 Too Many Requests
 *   }
 *
 *   // Continue with your API logic...
 *   // Optionally add headers to your response for client visibility
 * }
 * ```
 */
export async function rateLimitMiddleware(
  identifier: string,
  type: RateLimitType = "API"
): Promise<RateLimitMiddlewareResult> {
  const result = await checkRateLimit(identifier, type);
  const headers = createRateLimitHeaders(result);

  if (!result.success) {
    return {
      response: NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Please try again after ${new Date(result.reset).toISOString()}`,
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers,
        }
      ),
      pending: result.pending,
      headers,
    };
  }

  return {
    response: null,
    pending: result.pending,
    headers,
  };
}

// =============================================================================
// Custom Rate Limiter Creation
// =============================================================================

/**
 * Create a custom rate limiter with specific configuration
 * Use when the predefined limiters don't fit your needs
 *
 * @param requests - Number of requests allowed in the window
 * @param window - Time window (e.g., "1m", "1h", "1d")
 * @param prefix - Custom prefix for Redis keys
 * @returns Configured Ratelimit instance
 */
export function createCustomRateLimiter(
  requests: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string = "@hexwave/ratelimit:custom"
): Ratelimit {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix,
  });
}

// =============================================================================
// Exports
// =============================================================================

export { Ratelimit };

