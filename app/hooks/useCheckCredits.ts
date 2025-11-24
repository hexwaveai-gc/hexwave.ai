'use client'

import { useUser } from '@clerk/nextjs'
import { useUpgradePlan } from '@/app/providers/UpgradePlanProvider'
import { useCallback } from 'react'

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
  const { user, isLoaded } = useUser()
  const { openModal } = useUpgradePlan()

  // Get user credits from Clerk metadata or fetch from API
  // For now, we'll use availableBalance from user metadata
  // You may need to fetch this from your API if stored in MongoDB
  const userCredits = (user?.publicMetadata?.availableBalance as number) ?? 0

  /**
   * Check if user has enough credits
   */
  const hasEnoughCredits = useCallback((required: number): boolean => {
    if (!isLoaded || !user) {
      return false
    }
    return userCredits >= required
  }, [user, isLoaded, userCredits])

  /**
   * Check credits and optionally show modal if insufficient
   * @returns true if user has enough credits, false otherwise
   */
  const checkCredits = useCallback((options: CheckCreditsOptions): boolean => {
    const { requiredCredits, onInsufficient, onSufficient, showModal = true } = options

    if (!isLoaded || !user) {
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
  }, [user, isLoaded, userCredits, openModal])

  return {
    checkCredits,
    userCredits,
    hasEnoughCredits,
    isLoading: !isLoaded,
  }
}
