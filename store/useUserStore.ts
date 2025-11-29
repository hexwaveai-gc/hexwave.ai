/**
 * User Zustand Store
 * 
 * Global state management for user data including:
 * - Credits balance
 * - Subscription status
 * - User preferences
 * 
 * Automatically syncs with /api/me endpoint
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ============================================================================
// TYPES
// ============================================================================

export interface UserSubscription {
  id: string;
  status: "active" | "trialing" | "past_due" | "paused" | "canceled" | null;
  plan_name: string | null;
  plan_tier: "free" | "pro" | "basic" | "enterprise" | "custom" | null;
  billing_cycle: "monthly" | "annual" | null;
  current_period_start?: number;
  current_period_ends?: number;
  cancel_at_period_end?: boolean;
  next_payment_date?: number;
  next_credit_date?: number; // For annual plans - when next monthly credits are due
}

export interface UsageSummary {
  totalCredits: number;
  totalUsed: number;
  totalAdded: number;
  totalRefunded: number;
  byType: Record<string, number>;
  dailyUsage: Array<{ date: string; used: number; added: number }>;
}

export interface UserState {
  // User data
  credits: number;
  subscription: UserSubscription | null;
  balanceVerified: boolean;
  usageSummary: UsageSummary | null;

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  lastFetchedAt: number | null;
  error: string | null;

  // Actions
  setCredits: (credits: number) => void;
  setSubscription: (subscription: UserSubscription | null) => void;
  setUsageSummary: (summary: UsageSummary | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API actions
  fetchUser: (options?: { includeSummary?: boolean; force?: boolean }) => Promise<void>;
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
  reset: () => void;

  // Computed helpers
  hasActiveSubscription: () => boolean;
  hasEnoughCredits: (required: number) => boolean;
  getSubscriptionDaysLeft: () => number | null;
}

// ============================================================================
// API RESPONSE TYPE
// ============================================================================

interface UserMeData {
  credits: number;
  subscription: UserSubscription | null;
  balance_verified?: boolean;
  usage_summary?: UsageSummary;
}

/**
 * API response wrapper from ApiResponse.ok()
 * The actual data is nested inside { success: true, data: {...} }
 */
interface UserMeResponse {
  success: boolean;
  data: UserMeData;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  credits: 0,
  subscription: null,
  balanceVerified: false,
  usageSummary: null,
  isLoading: false,
  isInitialized: false,
  lastFetchedAt: null,
  error: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // --------------------------------------------------------------------
      // Basic Setters
      // --------------------------------------------------------------------

      setCredits: (credits) => set({ credits }),

      setSubscription: (subscription) => set({ subscription }),

      setUsageSummary: (usageSummary) => set({ usageSummary }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      // --------------------------------------------------------------------
      // API Actions
      // --------------------------------------------------------------------

      fetchUser: async (options = {}) => {
        const { includeSummary = false, force = false } = options;
        const state = get();

        // Skip if recently fetched (within 30 seconds) unless forced
        const now = Date.now();
        if (
          !force &&
          state.lastFetchedAt &&
          now - state.lastFetchedAt < 30000 &&
          state.isInitialized
        ) {
          return;
        }

        // Skip if already loading
        if (state.isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const url = includeSummary ? "/api/me?summary=true" : "/api/me";
          const response = await fetch(url);

          if (!response.ok) {
            if (response.status === 401) {
              // User not authenticated - reset state
              set({
                ...initialState,
                isInitialized: true,
                lastFetchedAt: now,
              });
              return;
            }
            throw new Error(`Failed to fetch user data: ${response.statusText}`);
          }

          const apiResponse: UserMeResponse = await response.json();
          
          // API response is wrapped in { success: true, data: {...} }
          const data = apiResponse.data;

          set({
            credits: data?.credits || 0,
            subscription: data?.subscription || null,
            balanceVerified: data?.balance_verified || false,
            usageSummary: data?.usage_summary || null,
            isLoading: false,
            isInitialized: true,
            lastFetchedAt: now,
            error: null,
          });
        } catch (error) {
          console.error("[UserStore] Error fetching user:", error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to fetch user",
          });
        }
      },

      deductCredits: (amount) => {
        const state = get();
        const newCredits = Math.max(0, state.credits - amount);
        set({ credits: newCredits });
      },

      addCredits: (amount) => {
        const state = get();
        set({ credits: state.credits + amount });
      },

      reset: () => set(initialState),

      // --------------------------------------------------------------------
      // Computed Helpers
      // --------------------------------------------------------------------

      hasActiveSubscription: () => {
        const { subscription } = get();
        return subscription?.status === "active" || subscription?.status === "trialing";
      },

      hasEnoughCredits: (required) => {
        const { credits } = get();
        return credits >= required;
      },

      getSubscriptionDaysLeft: () => {
        const { subscription } = get();
        if (!subscription?.current_period_ends) return null;

        const now = Date.now();
        const endsAt = subscription.current_period_ends;
        const daysLeft = Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24));

        return Math.max(0, daysLeft);
      },
    }),
    {
      name: "hexwave-user-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data
      partialize: (state) => ({
        credits: state.credits,
        subscription: state.subscription,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);

// ============================================================================
// SELECTORS (for optimized re-renders)
// ============================================================================

export const selectCredits = (state: UserState) => state.credits;
export const selectSubscription = (state: UserState) => state.subscription;
export const selectIsLoading = (state: UserState) => state.isLoading;
export const selectIsInitialized = (state: UserState) => state.isInitialized;
export const selectError = (state: UserState) => state.error;
export const selectUsageSummary = (state: UserState) => state.usageSummary;

// Computed selectors
export const selectHasActiveSubscription = (state: UserState) =>
  state.subscription?.status === "active" || state.subscription?.status === "trialing";

export const selectPlanName = (state: UserState) =>
  state.subscription?.plan_name || "Free";

export const selectPlanTier = (state: UserState) =>
  state.subscription?.plan_tier || "free";

