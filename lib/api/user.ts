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

/**
 * API response wrapper from ApiResponse.ok()
 * The actual data is nested inside { success: true, data: {...} }
 */
interface ApiUserMeResponse {
  success: boolean;
  data: UserMeResponse;
}

export interface FetchUserOptions {
  includeSummary?: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch current user data
 * 
 * Note: API returns wrapped response { success: true, data: {...} }
 * so we need to unwrap it before returning
 */
export async function fetchUser(options: FetchUserOptions = {}): Promise<UserMeResponse> {
  const { includeSummary = false } = options;
  
  const response = await api.get<ApiUserMeResponse>("/api/me", {
    summary: includeSummary ? "true" : undefined,
  });
  
  // Unwrap the API response - data is nested inside { success, data }
  return response.data;
}

/**
 * Alias for fetchUser (used by store)
 */
export const getUser = fetchUser;

