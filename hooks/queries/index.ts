/**
 * Query Hooks Module
 *
 * Reusable query hooks built on TanStack Query.
 * Import hooks from "@/hooks/queries" for clean access.
 *
 * This file serves as the entry point for all custom query hooks.
 * Add your custom hooks here as the application grows.
 *
 * Example usage:
 * ```ts
 * import { useUserQuery, useImagesQuery } from "@/hooks/queries";
 *
 * function MyComponent() {
 *   const { data: user } = useUserQuery(userId);
 *   const { data: images } = useImagesQuery({ status: "completed" });
 * }
 * ```
 */

// Re-export query utilities for convenience
export { queryKeys, useQuery, useMutation, useQueryClient } from "@/lib/query";

// Task hooks (example implementation)
export * from "./use-tasks";

// Process status hooks (TanStack Query + Ably real-time)
export * from "./use-process";

// Credit hooks (balance and transaction history)
export * from "./use-credits";

// =============================================================================
// Example Query Options (using queryOptions pattern)
// =============================================================================

import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { STALE_TIME_LONG } from "@/constants/query";

/**
 * Example: User query options factory
 *
 * Use queryOptions for type-safe, reusable query configurations.
 * This pattern provides full TypeScript inference.
 *
 * @example
 * ```ts
 * // In a component
 * const { data } = useQuery(userQueryOptions(userId));
 *
 * // For prefetching
 * queryClient.prefetchQuery(userQueryOptions(userId));
 *
 * // For setting data
 * queryClient.setQueryData(userQueryOptions(userId).queryKey, newData);
 * ```
 */
export function userQueryOptions(userId: string) {
  return queryOptions({
    queryKey: queryKeys.user.detail(userId),
    queryFn: async () => {
      // Replace with your actual API call
      const response = await fetch(`/api/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
    staleTime: STALE_TIME_LONG,
  });
}

/**
 * Example: User credits query options
 */
export function userCreditsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: queryKeys.user.credits(userId),
    queryFn: async () => {
      const response = await fetch(`/api/user/${userId}/credits`);
      if (!response.ok) throw new Error("Failed to fetch credits");
      return response.json();
    },
    staleTime: STALE_TIME_LONG,
  });
}

