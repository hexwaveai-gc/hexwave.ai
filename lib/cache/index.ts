/**
 * Cache Module Exports
 *
 * Centralized exports for all caching functionality.
 * Import from "@/lib/cache" for clean access.
 */

// Redis client
export { redis, Redis } from "../redis";

// Cache utilities
export {
  // Key building
  buildCacheKey,
  buildCompositeKey,
  // Core operations
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheExists,
  cacheTTL,
  cacheExtendTTL,
  // Advanced operations
  cacheGetOrSet,
  cacheSetIfNotExists,
  cacheInvalidatePattern,
  cacheIncrement,
  cacheDecrement,
  // Hash operations
  cacheHashSet,
  cacheHashGet,
  cacheHashGetAll,
  cacheHashDelete,
  // Convenience functions
  cacheUserData,
  getCachedUserData,
  invalidateUserCache,
  cacheConfig,
  getCachedConfig,
  // Re-export prefix
  CACHE_PREFIX,
} from "../cache";

// Rate limiting
export {
  // Pre-configured limiters
  apiRateLimiter,
  generationRateLimiter,
  authRateLimiter,
  publicRateLimiter,
  // Helper functions
  checkRateLimit,
  createRateLimitHeaders,
  getRateLimitIdentifier,
  rateLimitMiddleware,
  createCustomRateLimiter,
  // Types
  type RateLimitResult,
  type RateLimitMiddlewareResult,
  Ratelimit,
} from "../rate-limiter";

// Constants
export {
  // TTL values
  TTL_SHORT,
  TTL_MEDIUM,
  TTL_LONG,
  TTL_EXTENDED,
  TTL_WEEK,
  // Prefixes
  CACHE_PREFIX as CachePrefix,
  // Rate limit config
  RATE_LIMIT_CONFIG,
  // Types
  type CachePrefix as CachePrefixType,
  type RateLimitType,
} from "@/constants/cache";

