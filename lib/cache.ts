import { redis } from "./redis";
import {
  CACHE_PREFIX,
  TTL_MEDIUM,
  type CachePrefix,
} from "@/constants/cache";

/**
 * Cache utilities for Upstash Redis
 *
 * Provides type-safe, reusable caching functions following DRY principles.
 * All data is automatically serialized/deserialized as JSON.
 */

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Build a cache key with prefix and identifier
 * @param prefix - Cache key prefix from CACHE_PREFIX
 * @param identifier - Unique identifier for the cached item
 * @returns Formatted cache key
 */
export function buildCacheKey(prefix: CachePrefix, identifier: string): string {
  return `${prefix}:${identifier}`;
}

/**
 * Build a composite cache key with multiple parts
 * @param parts - Array of key parts to join
 * @returns Formatted cache key
 */
export function buildCompositeKey(...parts: string[]): string {
  return parts.join(":");
}

// =============================================================================
// Core Cache Operations
// =============================================================================

/**
 * Get a cached value by key
 * @param key - Cache key
 * @returns Cached value or null if not found
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    console.error(`Cache GET error for key "${key}":`, error);
    return null;
  }
}

/**
 * Set a value in cache with optional TTL
 * @param key - Cache key
 * @param value - Value to cache (will be JSON serialized)
 * @param ttl - Time to live in seconds (optional, defaults to TTL_MEDIUM)
 * @returns Success status
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttl: number = TTL_MEDIUM
): Promise<boolean> {
  try {
    await redis.set(key, value, { ex: ttl });
    return true;
  } catch (error) {
    console.error(`Cache SET error for key "${key}":`, error);
    return false;
  }
}

/**
 * Delete a cached value
 * @param key - Cache key to delete
 * @returns Number of keys deleted
 */
export async function cacheDelete(key: string): Promise<number> {
  try {
    return await redis.del(key);
  } catch (error) {
    console.error(`Cache DELETE error for key "${key}":`, error);
    return 0;
  }
}

/**
 * Check if a key exists in cache
 * @param key - Cache key to check
 * @returns True if key exists
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`Cache EXISTS error for key "${key}":`, error);
    return false;
  }
}

/**
 * Get the TTL (time to live) of a key
 * @param key - Cache key
 * @returns TTL in seconds, -1 if no TTL, -2 if key doesn't exist
 */
export async function cacheTTL(key: string): Promise<number> {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error(`Cache TTL error for key "${key}":`, error);
    return -2;
  }
}

/**
 * Extend the TTL of an existing key
 * @param key - Cache key
 * @param ttl - New TTL in seconds
 * @returns True if TTL was set
 */
export async function cacheExtendTTL(
  key: string,
  ttl: number
): Promise<boolean> {
  try {
    const result = await redis.expire(key, ttl);
    return result === 1;
  } catch (error) {
    console.error(`Cache EXPIRE error for key "${key}":`, error);
    return false;
  }
}

// =============================================================================
// Advanced Cache Operations
// =============================================================================

/**
 * Cache-aside pattern: Get from cache or fetch and cache
 * This is the most commonly used caching pattern.
 *
 * @param key - Cache key
 * @param fetcher - Async function to fetch data if not cached
 * @param ttl - Time to live in seconds
 * @returns Cached or freshly fetched data
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = TTL_MEDIUM
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key);

  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const freshData = await fetcher();

  // Cache the result (don't await to avoid blocking)
  cacheSet(key, freshData, ttl).catch((error) => {
    console.error(`Background cache SET failed for key "${key}":`, error);
  });

  return freshData;
}

/**
 * Set a value only if the key doesn't already exist
 * Useful for distributed locks and deduplication
 *
 * @param key - Cache key
 * @param value - Value to set
 * @param ttl - Time to live in seconds
 * @returns True if the value was set (key didn't exist)
 */
export async function cacheSetIfNotExists<T>(
  key: string,
  value: T,
  ttl: number = TTL_MEDIUM
): Promise<boolean> {
  try {
    const result = await redis.set(key, value, { ex: ttl, nx: true });
    return result === "OK";
  } catch (error) {
    console.error(`Cache SETNX error for key "${key}":`, error);
    return false;
  }
}

/**
 * Invalidate all cache keys matching a pattern
 * WARNING: Use sparingly as SCAN can be slow on large datasets
 *
 * @param pattern - Pattern to match (e.g., "user:*")
 * @returns Number of keys deleted
 */
export async function cacheInvalidatePattern(pattern: string): Promise<number> {
  try {
    let cursor = 0;
    let deletedCount = 0;

    do {
      const result = await redis.scan(cursor, {
        match: pattern,
        count: 100,
      });
      cursor = Number(result[0]);
      const keys = result[1];

      if (keys.length > 0) {
        const deleted = await redis.del(...keys);
        deletedCount += deleted;
      }
    } while (cursor !== 0);

    return deletedCount;
  } catch (error) {
    console.error(`Cache invalidate pattern error for "${pattern}":`, error);
    return 0;
  }
}

/**
 * Increment a counter in cache
 * Useful for rate limiting, analytics, etc.
 *
 * @param key - Cache key
 * @param amount - Amount to increment (default: 1)
 * @returns New counter value
 */
export async function cacheIncrement(
  key: string,
  amount: number = 1
): Promise<number> {
  try {
    if (amount === 1) {
      return await redis.incr(key);
    }
    return await redis.incrby(key, amount);
  } catch (error) {
    console.error(`Cache INCREMENT error for key "${key}":`, error);
    return 0;
  }
}

/**
 * Decrement a counter in cache
 *
 * @param key - Cache key
 * @param amount - Amount to decrement (default: 1)
 * @returns New counter value
 */
export async function cacheDecrement(
  key: string,
  amount: number = 1
): Promise<number> {
  try {
    if (amount === 1) {
      return await redis.decr(key);
    }
    return await redis.decrby(key, amount);
  } catch (error) {
    console.error(`Cache DECREMENT error for key "${key}":`, error);
    return 0;
  }
}

// =============================================================================
// Hash Operations (for storing objects with multiple fields)
// =============================================================================

/**
 * Set a field in a hash
 * @param key - Hash key
 * @param field - Field name
 * @param value - Field value
 * @returns Number of fields added
 */
export async function cacheHashSet<T>(
  key: string,
  field: string,
  value: T
): Promise<number> {
  try {
    return await redis.hset(key, { [field]: value });
  } catch (error) {
    console.error(`Cache HSET error for key "${key}":`, error);
    return 0;
  }
}

/**
 * Get a field from a hash
 * @param key - Hash key
 * @param field - Field name
 * @returns Field value or null
 */
export async function cacheHashGet<T>(
  key: string,
  field: string
): Promise<T | null> {
  try {
    return await redis.hget<T>(key, field);
  } catch (error) {
    console.error(`Cache HGET error for key "${key}":`, error);
    return null;
  }
}

/**
 * Get all fields from a hash
 * @param key - Hash key
 * @returns Object with all fields or null
 */
export async function cacheHashGetAll<T extends Record<string, unknown>>(
  key: string
): Promise<T | null> {
  try {
    return await redis.hgetall<T>(key);
  } catch (error) {
    console.error(`Cache HGETALL error for key "${key}":`, error);
    return null;
  }
}

/**
 * Delete a field from a hash
 * @param key - Hash key
 * @param field - Field name to delete
 * @returns Number of fields deleted
 */
export async function cacheHashDelete(
  key: string,
  field: string
): Promise<number> {
  try {
    return await redis.hdel(key, field);
  } catch (error) {
    console.error(`Cache HDEL error for key "${key}":`, error);
    return 0;
  }
}

// =============================================================================
// Convenience Functions with Built-in Key Prefixes
// =============================================================================

/**
 * Cache user-related data with automatic key prefix
 * @param userId - User ID
 * @param data - Data to cache
 * @param ttl - Time to live in seconds
 */
export async function cacheUserData<T>(
  userId: string,
  data: T,
  ttl: number = TTL_MEDIUM
): Promise<boolean> {
  const key = buildCacheKey(CACHE_PREFIX.USER, userId);
  return cacheSet(key, data, ttl);
}

/**
 * Get cached user data
 * @param userId - User ID
 * @returns Cached user data or null
 */
export async function getCachedUserData<T>(userId: string): Promise<T | null> {
  const key = buildCacheKey(CACHE_PREFIX.USER, userId);
  return cacheGet<T>(key);
}

/**
 * Invalidate user cache
 * @param userId - User ID
 * @returns Number of keys deleted
 */
export async function invalidateUserCache(userId: string): Promise<number> {
  const key = buildCacheKey(CACHE_PREFIX.USER, userId);
  return cacheDelete(key);
}

/**
 * Cache configuration data with automatic key prefix
 * @param configId - Configuration identifier
 * @param data - Configuration data
 * @param ttl - Time to live in seconds
 */
export async function cacheConfig<T>(
  configId: string,
  data: T,
  ttl: number = TTL_MEDIUM
): Promise<boolean> {
  const key = buildCacheKey(CACHE_PREFIX.CONFIG, configId);
  return cacheSet(key, data, ttl);
}

/**
 * Get cached configuration
 * @param configId - Configuration identifier
 * @returns Cached configuration or null
 */
export async function getCachedConfig<T>(configId: string): Promise<T | null> {
  const key = buildCacheKey(CACHE_PREFIX.CONFIG, configId);
  return cacheGet<T>(key);
}

// =============================================================================
// Exports
// =============================================================================

export { CACHE_PREFIX };





