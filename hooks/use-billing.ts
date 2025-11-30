/**
 * Billing Hooks
 * 
 * TanStack Query hooks for billing operations.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/client";
import {
  fetchBilling,
  performBillingAction,
  getPortalUrl,
  type BillingData,
  type BillingAction,
} from "@/lib/api";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook for fetching billing data
 */
export function useBilling(enabled: boolean = true) {
  return useQuery<BillingData>({
    queryKey: queryKeys.billing.details(),
    queryFn: fetchBilling,
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for getting portal URL
 */
export function useBillingPortal() {
  return useQuery({
    queryKey: queryKeys.billing.portal(),
    queryFn: getPortalUrl,
    enabled: false, // Only fetch on demand
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook for performing billing actions (cancel, pause, resume, etc.)
 */
export function useBillingAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: BillingAction) => performBillingAction(action),
    onSuccess: () => {
      // Invalidate billing data
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
      // Invalidate user data (subscription status may have changed)
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });
}

/**
 * Hook for getting payment method update transaction
 * 
 * Returns a transactionId that should be used with Paddle.js overlay.
 * The component using this hook should:
 * 1. Call mutate() to get the transactionId
 * 2. Use window.Paddle.Checkout.open({ transactionId }) to open the overlay
 */
export function useOpenPortal() {
  return useMutation({
    mutationFn: getPortalUrl,
  });
}
