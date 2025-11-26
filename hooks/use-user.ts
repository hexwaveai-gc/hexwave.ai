/**
 * User Hooks
 * 
 * TanStack Query hooks for user data.
 * This is the PRIMARY way to fetch user data across the app.
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { queryKeys } from "@/lib/query/client";
import { fetchUser, type UserMeResponse } from "@/lib/api";
import { useUserStore } from "@/store";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook for fetching and syncing user data
 * 
 * This is the primary hook for user data. It:
 * 1. Fetches user data via TanStack Query
 * 2. Syncs the data to Zustand store for global access
 * 3. Handles auth state changes
 */
export function useUserData(options: { includeSummary?: boolean } = {}) {
  const { includeSummary = false } = options;
  const { isSignedIn, isLoaded } = useAuth();
  const setCredits = useUserStore((state) => state.setCredits);
  const setSubscription = useUserStore((state) => state.setSubscription);
  const setUsageSummary = useUserStore((state) => state.setUsageSummary);
  const reset = useUserStore((state) => state.reset);

  const query = useQuery<UserMeResponse>({
    queryKey: includeSummary 
      ? [...queryKeys.user.me(), "with-summary"] 
      : queryKeys.user.me(),
    queryFn: () => fetchUser({ includeSummary }),
    enabled: isLoaded && isSignedIn,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Sync to Zustand store when data changes
  useEffect(() => {
    if (query.data) {
      setCredits(query.data.credits);
      setSubscription(query.data.subscription);
      if (query.data.usage_summary) {
        setUsageSummary(query.data.usage_summary);
      }
    }
  }, [query.data, setCredits, setSubscription, setUsageSummary]);

  // Reset store when signed out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      reset();
    }
  }, [isLoaded, isSignedIn, reset]);

  return query;
}

/**
 * Hook for fetching user data with usage summary
 */
export function useUserDataWithSummary() {
  return useUserData({ includeSummary: true });
}

/**
 * Hook to invalidate user data queries
 * Use this after mutations that affect user data
 */
export function useInvalidateUserData() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
  }, [queryClient]);
}

/**
 * Hook for refetching user data imperatively
 * Use this when you need to force refresh (e.g., after checkout)
 */
export function useRefetchUserData() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: queryKeys.user.me() });
  }, [queryClient]);
}

// ============================================================================
// Combined User Hook (convenience)
// ============================================================================

/**
 * Comprehensive user hook that provides data + helpers
 * 
 * @example
 * ```tsx
 * const { 
 *   credits, 
 *   subscription, 
 *   isLoading, 
 *   hasActiveSubscription,
 *   refetch 
 * } = useUser();
 * ```
 */
export function useUser() {
  const query = useUserData();
  const store = useUserStore();
  const invalidate = useInvalidateUserData();

  return {
    // TanStack Query data
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    
    // Store data (for convenience, synced from query)
    credits: store.credits,
    subscription: store.subscription,
    usageSummary: store.usageSummary,
    
    // Actions
    refetch: query.refetch,
    invalidate,
    
    // Helpers
    hasActiveSubscription: store.hasActiveSubscription(),
    hasEnoughCredits: store.hasEnoughCredits,
    daysLeftInPeriod: store.getSubscriptionDaysLeft(),
    planName: store.subscription?.plan_name || "Free",
    planTier: store.subscription?.plan_tier || "free",
  };
}
