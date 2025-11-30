// =============================================================================
// AUTH TYPES
// =============================================================================

/**
 * Clerk error structure for type-safe error handling
 */
export type ClerkError = {
  errors?: Array<{ message?: string; code?: string; longMessage?: string }>;
  message?: string;
  code?: string;
};

/**
 * Parsed error result with message and optional code
 */
export interface ParsedError {
  message: string;
  code?: string;
}

/**
 * Auth mode for sign-in/sign-up flows
 */
export type AuthMode = "sign-up" | "sign-in";

/**
 * OAuth strategies supported
 */
export type OAuthStrategy = "oauth_google" | "oauth_apple";

/**
 * Auth flow state for tracking which flow the user is in
 */
export interface AuthFlowState {
  email: string;
  code: string;
  showEmailInput: boolean;
  showCodeInput: boolean;
  isLoading: boolean;
  error: string;
  isSignUpFlow: boolean;
  clerkLoadError: boolean;
  retryCount: number;
}

/**
 * Auth flow actions for managing state
 */
export interface AuthFlowActions {
  setEmail: (email: string) => void;
  setCode: (code: string) => void;
  setShowEmailInput: (show: boolean) => void;
  setShowCodeInput: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setIsSignUpFlow: (isSignUp: boolean) => void;
  setClerkLoadError: (hasError: boolean) => void;
  setRetryCount: React.Dispatch<React.SetStateAction<number>>;
  resetForm: () => void;
  handleBack: () => void;
}
