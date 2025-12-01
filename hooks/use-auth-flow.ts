"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  CLERK_LOAD_TIMEOUT,
  MAX_RETRY_ATTEMPTS,
  AUTH_ERROR_MESSAGES,
} from "@/app/components/common/auth/constants";

// =============================================================================
// TYPES
// =============================================================================

interface UseAuthFlowOptions {
  /** Redirect path after successful auth */
  redirectTo?: string;
  /** Whether to redirect if already signed in */
  redirectIfSignedIn?: boolean;
}

interface UseAuthFlowReturn {
  // State
  email: string;
  code: string;
  showEmailInput: boolean;
  showCodeInput: boolean;
  isLoading: boolean;
  error: string;
  isSignUpFlow: boolean;
  clerkLoadError: boolean;
  retryCount: number;

  // Setters
  setEmail: (email: string) => void;
  setCode: (code: string) => void;
  setShowEmailInput: (show: boolean) => void;
  setShowCodeInput: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setIsSignUpFlow: (isSignUp: boolean) => void;
  setClerkLoadError: (hasError: boolean) => void;

  // Actions
  handleBack: () => void;
  handleRetry: () => void;
  resetForm: () => void;

  // Refs
  mounted: React.MutableRefObject<boolean>;

  // User state
  isSignedIn: boolean | undefined;
  userLoaded: boolean;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Custom hook for managing auth flow state across sign-in and sign-up pages
 */
export function useAuthFlow(options: UseAuthFlowOptions = {}): UseAuthFlowReturn {
  const { redirectTo = "/explore", redirectIfSignedIn = true } = options;
  const router = useRouter();
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUpFlow, setIsSignUpFlow] = useState(false);
  const [clerkLoadError, setClerkLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Refs for cleanup
  const mounted = useRef(true);

  // ==========================================================================
  // AUTH STATE MONITORING
  // ==========================================================================

  // Redirect if already signed in
  useEffect(() => {
    if (redirectIfSignedIn && isSignedIn && userLoaded) {
      router.replace(redirectTo);
    }
  }, [isSignedIn, userLoaded, router, redirectTo, redirectIfSignedIn]);

  // Cleanup on unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  const handleBack = useCallback(() => {
    if (showCodeInput) {
      setShowCodeInput(false);
      setCode("");
      setError("");
      setIsSignUpFlow(false);
    } else if (showEmailInput) {
      setShowEmailInput(false);
      setEmail("");
      setError("");
    }
  }, [showCodeInput, showEmailInput]);

  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      setError("Maximum retry attempts reached. Please refresh the page.");
      return;
    }

    setRetryCount((prev) => prev + 1);
    setError("");
    setClerkLoadError(false);

    // Force reload Clerk by reloading the page
    window.location.reload();
  }, [retryCount]);

  const resetForm = useCallback(() => {
    setEmail("");
    setCode("");
    setShowEmailInput(false);
    setShowCodeInput(false);
    setError("");
    setIsSignUpFlow(false);
  }, []);

  return {
    // State
    email,
    code,
    showEmailInput,
    showCodeInput,
    isLoading,
    error,
    isSignUpFlow,
    clerkLoadError,
    retryCount,

    // Setters
    setEmail,
    setCode,
    setShowEmailInput,
    setShowCodeInput,
    setIsLoading,
    setError,
    setIsSignUpFlow,
    setClerkLoadError,

    // Actions
    handleBack,
    handleRetry,
    resetForm,

    // Refs
    mounted,

    // User state
    isSignedIn,
    userLoaded,
  };
}

// =============================================================================
// CLERK LOADING HOOK
// =============================================================================

interface UseClerkLoadingOptions {
  isLoaded: boolean;
  onLoadError?: () => void;
}

interface UseClerkLoadingReturn {
  clerkLoadError: boolean;
  setClerkLoadError: (hasError: boolean) => void;
  loadError: string;
}

/**
 * Hook for monitoring Clerk loading state with timeout
 */
export function useClerkLoading(options: UseClerkLoadingOptions): UseClerkLoadingReturn {
  const { isLoaded, onLoadError } = options;
  const [clerkLoadError, setClerkLoadError] = useState(false);
  const [loadError, setLoadError] = useState("");
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Set timeout for Clerk loading
    loadTimeoutRef.current = setTimeout(() => {
      if (!isLoaded) {
        setClerkLoadError(true);
        setLoadError(AUTH_ERROR_MESSAGES.failed_to_load_clerk_js_timeout);
        onLoadError?.();
      }
    }, CLERK_LOAD_TIMEOUT);

    // Clear timeout if Clerk loads successfully
    if (isLoaded) {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      setClerkLoadError(false);
      setLoadError("");
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isLoaded, onLoadError]);

  return {
    clerkLoadError,
    setClerkLoadError,
    loadError,
  };
}


