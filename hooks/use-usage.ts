/**
 * Usage Hooks
 * 
 * TanStack Query hooks for credit usage history.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/client";
import {
  fetchUsage,
  fetchUsageSummary,
  type UsageData,
  type UsageFilters,
  type UsageDailySummary,
} from "@/lib/api";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook for fetching usage history with filters
 */
export function useUsage(filters: UsageFilters = {}, enabled: boolean = true) {
  return useQuery<UsageData>({
    queryKey: queryKeys.usage.list(filters),
    queryFn: () => fetchUsage(filters),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

/**
 * Hook for fetching usage summary
 */
export function useUsageSummary(days: number = 30, enabled: boolean = true) {
  return useQuery<UsageDailySummary>({
    queryKey: queryKeys.usage.summary(days),
    queryFn: () => fetchUsageSummary(days),
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

