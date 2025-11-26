/**
 * TanStack Query Module Exports
 *
 * Centralized exports for all React Query functionality.
 * Import from "@/lib/query" for clean access.
 */

// Provider
export { QueryProvider } from "./query-provider";

// Query Client
export { makeQueryClient, getQueryClient } from "./query-client";

// Query Keys
export {
  queryKeys,
  userKeys,
  imageKeys,
  videoKeys,
  modelKeys,
  exploreKeys,
  processKeys,
  type ImageFilters,
  type VideoFilters,
  type ExploreFilters,
  type ProcessFilters,
  type ProcessStatusType,
  type UserKeys,
  type ImageKeys,
  type VideoKeys,
  type ModelKeys,
  type ExploreKeys,
  type ProcessKeys,
  type QueryKeys,
} from "./query-keys";

// Re-export commonly used TanStack Query hooks and utilities
export {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  useSuspenseQuery,
  useQueries,
  queryOptions,
  infiniteQueryOptions,
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";

// Constants
export {
  STALE_TIME_DEFAULT,
  STALE_TIME_SHORT,
  STALE_TIME_LONG,
  STALE_TIME_EXTENDED,
  STALE_TIME_INFINITE,
  GC_TIME_DEFAULT,
  GC_TIME_SHORT,
  GC_TIME_LONG,
  RETRY_COUNT_DEFAULT,
  RETRY_COUNT_MUTATION,
  RETRY_COUNT_NONE,
  retryDelay,
  DEFAULT_QUERY_OPTIONS,
  DEFAULT_MUTATION_OPTIONS,
} from "@/constants/query";

