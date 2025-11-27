/**
 * API Layer - Centralized exports
 * 
 * Export all API functions from a single entry point.
 * 
 * NOTE: Auth middleware is NOT exported here because it uses Node.js-only
 * modules (async_hooks for logging). Import it directly from:
 *   import { withAuth, ... } from "@/lib/api/auth-middleware";
 */

// Base client
export { api, ApiError } from "./client";

// User API
export { fetchUser, getUser, type UserMeResponse, type FetchUserOptions } from "./user";

// Billing API
export {
  fetchBilling,
  performBillingAction,
  getPortalUrl,
  type BillingData,
  type BillingSubscription,
  type BillingTransaction,
  type BillingPortalResponse,
  type BillingActionResponse,
  type BillingAction,
} from "./billing";

// Usage API
export {
  fetchUsage,
  fetchUsageSummary,
  type UsageData,
  type UsageEntry,
  type UsagePagination,
  type UsageSummary,
  type UsageFilters,
  type UsageDailySummary,
} from "./usage";

// Profile API
export {
  fetchProfile,
  updateProfile,
  checkUsername,
  type UserProfile,
  type UpdateProfileData,
  type SocialLinks,
  type ProfileStats,
  type ProfilePreferences,
  type UsernameCheckResponse,
} from "./profile";

// Audio API
export {
  fetchVoices,
  generateAudio,
  fetchAudioHistory,
  deleteAudioHistoryItem,
} from "./audio";

