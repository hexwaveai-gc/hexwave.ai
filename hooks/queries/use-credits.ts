/**
 * Credit Hooks
 * 
 * TanStack Query hooks for fetching user credits and transaction history.
 * These hooks integrate with the credit system for displaying balance
 * and transaction history in the UI.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { STALE_TIME_DEFAULT, STALE_TIME_LONG } from "@/constants/query";
import type { CreditTransactionFilters } from "@/lib/query/query-keys";

// =============================================================================
// Types
// =============================================================================

export interface UserCreditsData {
  userId: string;
  availableBalance: number;
}

export interface CreditTransaction {
  _id: string;
  userId: string;
  processId: string | null;
  type: "DEDUCTION" | "REFUND" | "CREDIT_ADDED";
  amount: number;
  category: "image" | "video" | null;
  toolName: string | null;
  description: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  createdAt: string;
}

export interface TransactionHistoryResponse {
  transactions: CreditTransaction[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// =============================================================================
// API Functions
// =============================================================================

async function fetchUserCredits(userId: string): Promise<UserCreditsData> {
  const response = await fetch(`/api/credits/balance?userId=${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch credits");
  }
  return response.json();
}

async function fetchTransactionHistory(
  userId: string,
  filters?: CreditTransactionFilters
): Promise<TransactionHistoryResponse> {
  const params = new URLSearchParams({ userId });
  
  if (filters?.type) params.set("type", filters.type);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);

  const response = await fetch(`/api/credits/transactions?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch transaction history");
  }
  return response.json();
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook to fetch user's credit balance
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useUserCredits(userId);
 * if (data) {
 *   console.log(`Balance: ${data.availableBalance}`);
 * }
 * ```
 */
export function useUserCredits(userId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.credits.balance(userId!),
    queryFn: () => fetchUserCredits(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME_DEFAULT,
  });
}

/**
 * Hook to fetch user's transaction history
 * 
 * @example
 * ```tsx
 * const { data } = useTransactionHistory(userId, { limit: 20, page: 1 });
 * ```
 */
export function useTransactionHistory(
  userId: string | null | undefined,
  filters?: CreditTransactionFilters
) {
  return useQuery({
    queryKey: queryKeys.credits.transactions(userId!, filters),
    queryFn: () => fetchTransactionHistory(userId!, filters),
    enabled: !!userId,
    staleTime: STALE_TIME_LONG,
  });
}

/**
 * Hook to check if user has enough credits
 * Returns a simple boolean check function
 * 
 * @example
 * ```tsx
 * const { hasEnough, balance, isLoading } = useCreditsCheck(userId);
 * if (hasEnough(100)) {
 *   // User has at least 100 credits
 * }
 * ```
 */
export function useCreditsCheck(userId: string | null | undefined) {
  const { data, isLoading, error } = useUserCredits(userId);

  return {
    balance: data?.availableBalance ?? 0,
    hasEnough: (amount: number) => (data?.availableBalance ?? 0) >= amount,
    isLoading,
    error,
  };
}

/**
 * Hook to invalidate credits cache
 * Call this after any operation that changes user's credits
 * 
 * @example
 * ```tsx
 * const invalidateCredits = useInvalidateCredits();
 * 
 * // After starting a process
 * await startProcess();
 * invalidateCredits(userId);
 * ```
 */
export function useInvalidateCredits() {
  const queryClient = useQueryClient();

  return (userId: string) => {
    // Invalidate balance
    queryClient.invalidateQueries({
      queryKey: queryKeys.credits.balance(userId),
    });
    // Invalidate all transaction queries for this user
    queryClient.invalidateQueries({
      queryKey: ["credits", "transactions", userId],
    });
  };
}

