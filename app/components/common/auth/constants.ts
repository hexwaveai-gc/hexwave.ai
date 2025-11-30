// =============================================================================
// AUTH VIDEOS
// =============================================================================

export const AUTH_VIDEOS = [
  {
    url: "https://cdn.higgsfield.ai/kling_motion/8c4795a8-e7ef-4272-8fb3-9d349192a013.mp4",
    poster: "https://cdn.higgsfield.ai/kling_motion/94b61df4-fff8-4c97-8115-59d8f2fcd93d.webp",
    name: "Raven Transition",
  },
  {
    url: "https://cdn.higgsfield.ai/kling_motion/413e9bed-2fb7-4f61-b69f-e8c7466bfcf6.mp4",
    poster: "https://cdn.higgsfield.ai/kling_motion/c55aaeff-aff4-4555-829e-3ffdc193df7f.webp",
    name: "Splash Transition",
  },
  {
    url: "https://cdn.higgsfield.ai/wan2_2_motion/22b6f9ca-5469-4086-8956-a2deb4944307.mp4",
    poster: "https://cdn.higgsfield.ai/wan2_2_motion/792e4782-a153-4cd6-a4dc-9470fa92a39a.webp",
    name: "Ahegao",
  },
  {
    url: "https://cdn.higgsfield.ai/kling_motion/ecb6fc91-c4df-4133-95da-5e53108a7c6f.mp4",
    poster: "https://cdn.higgsfield.ai/kling_motion/0fb7068a-f7f0-470b-8b81-3ee5f99da7c9.webp",
    name: "Flying Cam Transition",
  },
] as const;

// =============================================================================
// CLERK CONFIGURATION
// =============================================================================

/** Timeout for Clerk JS to load (15 seconds) */
export const CLERK_LOAD_TIMEOUT = 15000;

/** Maximum retry attempts for loading errors */
export const MAX_RETRY_ATTEMPTS = 3;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

/**
 * User-friendly error messages mapped to Clerk error codes
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Account-related errors
  form_identifier_exists: "An account with this email already exists.",
  form_identifier_not_found: "No account found with this email.",
  
  // Verification errors
  form_code_incorrect: "Invalid verification code. Please check and try again.",
  form_code_expired: "Verification code has expired. Please request a new one.",
  
  // Session errors
  session_exists: "You're already signed in. Redirecting...",
  
  // Loading/network errors
  failed_to_load_clerk_js_timeout: "Authentication service is taking too long to load. Please refresh the page.",
  network_error: "Network error. Please check your connection and try again.",
  rate_limited: "Too many attempts. Please wait a moment and try again.",
  clerk_js_script_failed: "Failed to load authentication. Please refresh the page.",
} as const;

// =============================================================================
// RETRYABLE ERROR CODES
// =============================================================================

/**
 * Error codes that can be retried
 */
export const RETRYABLE_ERROR_CODES = [
  "network_error",
  "failed_to_load_clerk_js_timeout",
  "clerk_js_script_failed",
] as const;

// =============================================================================
// VALIDATION
// =============================================================================

/** Email validation regex */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Verification code length */
export const VERIFICATION_CODE_LENGTH = 6;

// Re-export AuthMode type from types.ts for backwards compatibility
export type { AuthMode } from "./types";



