'use client'

import { useUser } from '@clerk/nextjs'
import { useUpgradePlan } from '@/app/providers/UpgradePlanProvider'
import { useCallback } from 'react'
import { useUserCredits } from '@/hooks/queries/use-credits'

interface CheckCreditsOptions {
  requiredCredits: number
  onInsufficient?: () => void
  onSufficient?: () => void
  showModal?: boolean
}

interface UseCheckCreditsReturn {
  checkCredits: (options: CheckCreditsOptions) => boolean
  userCredits: number
  hasEnoughCredits: (required: number) => boolean
  isLoading: boolean
}

/**
 * Hook to check user credits and optionally show upgrade modal
 * 
 * Uses TanStack Query to fetch credits from MongoDB (via API).
 * 
 * @example
 * ```tsx
 * const { checkCredits, userCredits, hasEnoughCredits } = useCheckCredits()
 * 
 * const handleGenerate = () => {
 *   if (checkCredits({ requiredCredits: 10, showModal: true })) {
 *     // Proceed with generation
 *   }
 * }
 * ```
 */
export function useCheckCredits(): UseCheckCreditsReturn {
  const { user, isLoaded: isUserLoaded } = useUser()
  const { openModal } = useUpgradePlan()

  // Fetch credits from MongoDB via TanStack Query
  const { data: creditsData, isLoading: isCreditsLoading } = useUserCredits(user?.id)

  const isLoading = !isUserLoaded || isCreditsLoading
  const userCredits = creditsData?.availableBalance ?? 0

  /**
   * Check if user has enough credits
   */
  const hasEnoughCredits = useCallback((required: number): boolean => {
    if (isLoading || !user) {
      return false
    }
    return userCredits >= required
  }, [user, isLoading, userCredits])

  /**
   * Check credits and optionally show modal if insufficient
   * @returns true if user has enough credits, false otherwise
   */
  const checkCredits = useCallback((options: CheckCreditsOptions): boolean => {
    const { requiredCredits, onInsufficient, onSufficient, showModal = true } = options

    if (!isUserLoaded || !user) {
      // User not logged in - show modal or redirect to sign in
      if (showModal) {
        openModal()
      }
      onInsufficient?.()
      return false
    }

    const hasEnough = userCredits >= requiredCredits

    if (hasEnough) {
      onSufficient?.()
      return true
    } else {
      // Insufficient credits
      if (showModal) {
        openModal()
      }
      onInsufficient?.()
      return false
    }
  }, [user, isUserLoaded, userCredits, openModal])

  return {
    checkCredits,
    userCredits,
    hasEnoughCredits,
    isLoading,
  }
}
