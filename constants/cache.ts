/**
 * Cache configuration constants
 *
 * Centralized TTL values and cache key prefixes for Upstash Redis caching.
 * Following the project rule: all constants must be in the constants folder.
 */

// =============================================================================
// TTL (Time To Live) Values in seconds
// =============================================================================

/**
 * Short TTL - For frequently changing data
 * Use for: user sessions, real-time data, frequently updated content
 */
export const TTL_SHORT = 60; // 1 minute

/**
 * Medium TTL - For moderately cached data
 * Use for: user preferences, API responses that can be slightly stale
 */
export const TTL_MEDIUM = 300; // 5 minutes

/**
 * Long TTL - For rarely changing data
 * Use for: configuration data, static content, tool configs
 */
export const TTL_LONG = 3600; // 1 hour

/**
 * Extended TTL - For very stable data
 * Use for: aggregated data, analytics summaries
 */
export const TTL_EXTENDED = 86400; // 24 hours

/**
 * Week TTL - For highly stable reference data
 * Use for: model configurations, static references
 */
export const TTL_WEEK = 604800; // 7 days

// =============================================================================
// Cache Key Prefixes
// =============================================================================

/**
 * Key prefix naming convention: prefix:identifier
 * Example: "user:123", "config:image-generator"
 */

export const CACHE_PREFIX = {
  /** User-related data */
  USER: "user",
  /** User session data */
  SESSION: "session",
  /** Tool configurations */
  CONFIG: "config",
  /** API response caching */
  API: "api",
  /** Model configurations */
  MODEL: "model",
  /** Rate limiting */
  RATE_LIMIT: "ratelimit",
  /** Temporary data */
  TEMP: "temp",
  /** Generation results */
  GENERATION: "gen",
  /** Image generation specific */
  IMAGE: "image",
  /** Video generation specific */
  VIDEO: "video",
} as const;

// =============================================================================
// Rate Limiting Configuration
// =============================================================================

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMIT_CONFIG = {
  /** Standard API endpoints */
  API: {
    requests: 100,
    window: "1m", // 100 requests per minute
  },
  /** Generation endpoints (more restrictive) */
  GENERATION: {
    requests: 10,
    window: "1m", // 10 generations per minute
  },
  /** Auth endpoints (very restrictive) */
  AUTH: {
    requests: 5,
    window: "1m", // 5 auth attempts per minute
  },
  /** Public endpoints (lenient) */
  PUBLIC: {
    requests: 200,
    window: "1m", // 200 requests per minute
  },
} as const;

// =============================================================================
// Cache Utility Types
// =============================================================================

export type CachePrefix = (typeof CACHE_PREFIX)[keyof typeof CACHE_PREFIX];
export type RateLimitType = keyof typeof RATE_LIMIT_CONFIG;





