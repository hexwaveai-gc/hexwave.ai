import type { ClerkError, ParsedError } from "@/app/components/common/auth/types";
import {
  AUTH_ERROR_MESSAGES,
  RETRYABLE_ERROR_CODES,
  EMAIL_REGEX,
  VERIFICATION_CODE_LENGTH,
} from "@/app/components/common/auth/constants";

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Parse Clerk error into user-friendly message
 */
export function getErrorMessage(err: unknown): ParsedError {
  const error = err as ClerkError;

  // Handle Clerk runtime errors
  if (error?.code === "failed_to_load_clerk_js_timeout") {
    return {
      message: AUTH_ERROR_MESSAGES.failed_to_load_clerk_js_timeout,
      code: error.code,
    };
  }

  const errorCode = error?.errors?.[0]?.code || error?.code;
  const errorMessage =
    error?.errors?.[0]?.message ||
    error?.errors?.[0]?.longMessage ||
    error?.message;

  if (errorCode && AUTH_ERROR_MESSAGES[errorCode]) {
    return { message: AUTH_ERROR_MESSAGES[errorCode], code: errorCode };
  }

  return {
    message: errorMessage || "Something went wrong. Please try again.",
    code: errorCode,
  };
}

/**
 * Check if an error code is retryable
 */
export function isRetryableError(code?: string): boolean {
  return code ? RETRYABLE_ERROR_CODES.includes(code as typeof RETRYABLE_ERROR_CODES[number]) : false;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate email address format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { isValid: false, error: "Please enter your email address" };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true };
}

/**
 * Validate verification code format
 */
export function validateCode(code: string): { isValid: boolean; error?: string } {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    return { isValid: false, error: "Please enter the verification code" };
  }

  if (trimmedCode.length !== VERIFICATION_CODE_LENGTH) {
    return { isValid: false, error: `Please enter a valid ${VERIFICATION_CODE_LENGTH}-digit code` };
  }

  if (!/^\d+$/.test(trimmedCode)) {
    return { isValid: false, error: "Verification code must contain only numbers" };
  }

  return { isValid: true };
}

/**
 * Normalize email for consistent handling
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
