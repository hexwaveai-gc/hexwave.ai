/**
 * User API Functions
 * 
 * API functions for user-related endpoints.
 */

import api from "./client";
import type { UserSubscription, UsageSummary } from "@/store/useUserStore";

// ============================================================================
// Types
// ============================================================================

export interface UserMeResponse {
  credits: number;
  subscription: UserSubscription | null;
  balance_verified?: boolean;
  usage_summary?: UsageSummary;
}

export interface FetchUserOptions {
  includeSummary?: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch current user data
 */
export async function fetchUser(options: FetchUserOptions = {}): Promise<UserMeResponse> {
  const { includeSummary = false } = options;
  
  return api.get<UserMeResponse>("/api/me", {
    summary: includeSummary ? "true" : undefined,
  });
}

/**
 * Alias for fetchUser (used by store)
 */
export const getUser = fetchUser;

