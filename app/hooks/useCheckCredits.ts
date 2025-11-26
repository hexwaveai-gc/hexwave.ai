"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUpgradePlan } from "@/app/providers/UpgradePlanProvider";
import { useUser, useRefetchUserData } from "@/hooks";

interface CheckCreditsOptions {
  requiredCredits: number;
  onInsufficient?: () => void;
  onSufficient?: () => void;
  showModal?: boolean;
}

interface UseCheckCreditsReturn {
  checkCredits: (options: CheckCreditsOptions) => boolean;
  credits: number;
  hasEnoughCredits: (required: number) => boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to check user credits and optionally show upgrade modal
 * 
 * Uses TanStack Query for data fetching and Zustand for state.
 *
 * @example
 * ```tsx
 * const { checkCredits, credits, hasEnoughCredits, refetch } = useCheckCredits()
 *
 * const handleGenerate = async () => {
 *   if (checkCredits({ requiredCredits: 10, showModal: true })) {
 *     // Proceed with generation
 *   }
 * }
 * ```
 */
export function useCheckCredits(): UseCheckCreditsReturn {
  const { isSignedIn, isLoaded } = useAuth();
  const { openModal } = useUpgradePlan();
  
  // TanStack Query hooks
  const { credits, isLoading: isQueryLoading } = useUser();
  const refetchUserData = useRefetchUserData();

  const isLoading = !isLoaded || (isSignedIn && isQueryLoading);

  /**
   * Check if user has enough credits
   */
  const hasEnoughCredits = useCallback(
    (required: number): boolean => {
      if (!isLoaded || !isSignedIn) {
        return false;
      }
      return credits >= required;
    },
    [isLoaded, isSignedIn, credits]
  );

  /**
   * Check credits and optionally show modal if insufficient
   * @returns true if user has enough credits, false otherwise
   */
  const checkCredits = useCallback(
    (options: CheckCreditsOptions): boolean => {
      const { requiredCredits, onInsufficient, onSufficient, showModal = true } = options;

      if (!isLoaded || !isSignedIn) {
        // User not logged in - show modal or redirect to sign in
        if (showModal) {
          openModal();
        }
        onInsufficient?.();
        return false;
      }

      const hasEnough = credits >= requiredCredits;

      if (hasEnough) {
        onSufficient?.();
        return true;
      } else {
        // Insufficient credits
        if (showModal) {
          openModal();
        }
        onInsufficient?.();
        return false;
      }
    },
    [isLoaded, isSignedIn, credits, openModal]
  );

  /**
   * Refetch user data from API (via TanStack Query)
   */
  const refetch = useCallback(async () => {
    await refetchUserData();
  }, [refetchUserData]);

  return {
    checkCredits,
    credits,
    hasEnoughCredits,
    isLoading,
    refetch,
  };
}
