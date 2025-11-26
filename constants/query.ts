/**
 * TanStack Query Configuration Constants
 *
 * Centralized configuration for React Query following best practices from:
 * https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
 */

// =============================================================================
// Stale Time Configuration (milliseconds)
// =============================================================================

/**
 * Default stale time - data is considered fresh for this duration
 * Set > 0 to avoid immediate refetch after SSR hydration
 */
export const STALE_TIME_DEFAULT = 60 * 1000; // 1 minute

/**
 * Short stale time - for frequently changing data
 */
export const STALE_TIME_SHORT = 30 * 1000; // 30 seconds

/**
 * Long stale time - for rarely changing data
 */
export const STALE_TIME_LONG = 5 * 60 * 1000; // 5 minutes

/**
 * Extended stale time - for very stable data
 */
export const STALE_TIME_EXTENDED = 30 * 60 * 1000; // 30 minutes

/**
 * Infinite stale time - data never becomes stale automatically
 * Use for static data that only changes via manual invalidation
 */
export const STALE_TIME_INFINITE = Infinity;

// =============================================================================
// Garbage Collection Time (milliseconds)
// =============================================================================

/**
 * Default GC time - inactive queries are garbage collected after this duration
 * TanStack Query default is 5 minutes
 */
export const GC_TIME_DEFAULT = 5 * 60 * 1000; // 5 minutes

/**
 * Short GC time - for memory-sensitive scenarios
 */
export const GC_TIME_SHORT = 1 * 60 * 1000; // 1 minute

/**
 * Long GC time - keep data in cache longer
 */
export const GC_TIME_LONG = 30 * 60 * 1000; // 30 minutes

// =============================================================================
// Retry Configuration
// =============================================================================

/**
 * Default retry count for failed queries
 * TanStack Query default is 3
 */
export const RETRY_COUNT_DEFAULT = 4;

/**
 * Retry count for mutations (typically lower than queries)
 */
export const RETRY_COUNT_MUTATION = 1;

/**
 * No retries - for operations that shouldn't be retried
 */
export const RETRY_COUNT_NONE = 0;

/**
 * Exponential backoff delay function for retries
 * Attempts: 1000ms, 2000ms, 4000ms, 8000ms... (capped at 30s)
 */
export const retryDelay = (attemptIndex: number): number => {
  return Math.min(1000 * 2 ** attemptIndex, 30000);
};

// =============================================================================
// Refetch Configuration
// =============================================================================

/**
 * Refetch interval for polling (disabled by default)
 */
export const REFETCH_INTERVAL_DISABLED = false;

/**
 * Short polling interval
 */
export const REFETCH_INTERVAL_SHORT = 5 * 1000; // 5 seconds

/**
 * Standard polling interval
 */
export const REFETCH_INTERVAL_STANDARD = 30 * 1000; // 30 seconds

// =============================================================================
// Query Client Default Options
// =============================================================================

/**
 * Default options for all queries
 * These can be overridden per-query using queryOptions
 */
export const DEFAULT_QUERY_OPTIONS = {
  staleTime: STALE_TIME_DEFAULT,
  gcTime: GC_TIME_DEFAULT,
  retry: RETRY_COUNT_DEFAULT,
  retryDelay,
  refetchOnWindowFocus: false, // Disable to avoid unexpected refetches
  refetchOnReconnect: true, // Refetch when network reconnects
  refetchOnMount: true, // Refetch when component mounts if stale
} as const;

/**
 * Default options for all mutations
 */
export const DEFAULT_MUTATION_OPTIONS = {
  retry: RETRY_COUNT_MUTATION,
  retryDelay,
} as const;

