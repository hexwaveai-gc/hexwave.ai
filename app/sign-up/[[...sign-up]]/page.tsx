"use client";

import { useSignUp, useSignIn, useUser, SignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { X, RefreshCw } from "lucide-react";
import HexwaveLoader from "@/app/components/common/HexwaveLoader";
import {
  AuthVideoPlayer,
  OAuthButtons,
  EmailForm,
  CodeVerificationForm,
  AuthFooter,
  AuthHeader,
} from "@/app/components/common/auth";

// =============================================================================
// TYPES
// =============================================================================

type ClerkError = {
  errors?: Array<{ message?: string; code?: string; longMessage?: string }>;
  message?: string;
  code?: string;
};

// =============================================================================
// CONSTANTS
// =============================================================================

const CLERK_LOAD_TIMEOUT = 15000; // 15 seconds timeout for Clerk to load
const MAX_RETRY_ATTEMPTS = 3;

// Error code mappings for user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  form_identifier_exists: "An account with this email already exists. Signing you in...",
  form_code_incorrect: "Invalid verification code. Please check and try again.",
  form_code_expired: "Verification code has expired. Please request a new one.",
  form_identifier_not_found: "No account found. Please sign up first.",
  session_exists: "You're already signed in. Redirecting...",
  failed_to_load_clerk_js_timeout: "Authentication service is taking too long to load. Please refresh the page.",
  network_error: "Network error. Please check your connection and try again.",
  rate_limited: "Too many attempts. Please wait a moment and try again.",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getErrorMessage(err: unknown): { message: string; code?: string } {
  const error = err as ClerkError;
  
  // Handle Clerk runtime errors
  if (error?.code === "failed_to_load_clerk_js_timeout") {
    return { 
      message: ERROR_MESSAGES.failed_to_load_clerk_js_timeout, 
      code: error.code 
    };
  }
  
  const errorCode = error?.errors?.[0]?.code || error?.code;
  const errorMessage = error?.errors?.[0]?.message || 
                       error?.errors?.[0]?.longMessage || 
                       error?.message;
  
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return { message: ERROR_MESSAGES[errorCode], code: errorCode };
  }
  
  return { 
    message: errorMessage || "Something went wrong. Please try again.", 
    code: errorCode 
  };
}

function isRetryableError(code?: string): boolean {
  const retryableCodes = [
    "network_error",
    "failed_to_load_clerk_js_timeout",
    "clerk_js_script_failed",
  ];
  return code ? retryableCodes.includes(code) : false;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  
  // State
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignInFlow, setIsSignInFlow] = useState(false);
  const [clerkLoadError, setClerkLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Refs for cleanup
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mounted = useRef(true);

  // ==========================================================================
  // CLERK LOADING MONITORING
  // ==========================================================================

  useEffect(() => {
    mounted.current = true;
    
    // Set timeout for Clerk loading
    loadTimeoutRef.current = setTimeout(() => {
      if (!isLoaded || !signInLoaded) {
        setClerkLoadError(true);
        setError(ERROR_MESSAGES.failed_to_load_clerk_js_timeout);
      }
    }, CLERK_LOAD_TIMEOUT);

    // Clear timeout if Clerk loads successfully
    if (isLoaded && signInLoaded) {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      setClerkLoadError(false);
      // Only clear error if it was a load error
      if (error === ERROR_MESSAGES.failed_to_load_clerk_js_timeout) {
        setError("");
      }
    }

    return () => {
      mounted.current = false;
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isLoaded, signInLoaded, error]);

  // ==========================================================================
  // AUTH STATE MONITORING
  // ==========================================================================

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn && userLoaded) {
      router.replace("/explore");
    }
  }, [isSignedIn, userLoaded, router]);

  // Check for email verification flow from URL params
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam && signUp?.status === "missing_requirements") {
      setEmail(emailParam);
      setShowEmailInput(true);
      setShowCodeInput(true);
    }
  }, [searchParams, signUp?.status]);

  // ==========================================================================
  // RETRY HANDLER
  // ==========================================================================

  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      setError("Maximum retry attempts reached. Please refresh the page.");
      return;
    }
    
    setRetryCount(prev => prev + 1);
    setError("");
    setClerkLoadError(false);
    
    // Force reload Clerk by reloading the page
    window.location.reload();
  }, [retryCount]);

  // ==========================================================================
  // OAUTH HANDLERS
  // ==========================================================================

  const handleOAuthSignUp = useCallback(async (strategy: "oauth_google" | "oauth_apple") => {
    if (isLoading) return;
    
    // Check if Clerk is loaded
    if (!isLoaded || !signUp || !signInLoaded || !signIn) {
      if (clerkLoadError) {
        setError(ERROR_MESSAGES.failed_to_load_clerk_js_timeout);
      } else {
        setError("Authentication service is loading. Please wait...");
      }
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Try sign-up first
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sign-up/sso-callback",
        redirectUrlComplete: "/explore",
      });
    } catch (signUpErr) {
      // If sign-up redirect fails (user might exist), try sign-in
      try {
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sign-in/sso-callback",
          redirectUrlComplete: "/explore",
        });
      } catch (signInErr: unknown) {
        const { message, code } = getErrorMessage(signInErr);
        setError(message);
        
        // Check if error is retryable
        if (isRetryableError(code)) {
          setClerkLoadError(true);
        }
        
        setIsLoading(false);
      }
    }
  }, [isLoading, isLoaded, signUp, signInLoaded, signIn, clerkLoadError]);

  // ==========================================================================
  // EMAIL HANDLERS
  // ==========================================================================

  const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    
    // Check Clerk readiness
    if (!isLoaded || !signUp || !signInLoaded || !signIn) {
      if (clerkLoadError) {
        setError(ERROR_MESSAGES.failed_to_load_clerk_js_timeout);
      } else {
        setError("Authentication service is loading. Please wait...");
      }
      return;
    }

    setIsLoading(true);
    
    try {
      // Try to create account
      const result = await signUp.create({
        emailAddress: trimmedEmail,
      });

      if (result.status === "missing_requirements") {
        // Need email verification
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setIsSignInFlow(false);
        setShowCodeInput(true);
      } else if (result.status === "complete" && result.createdSessionId) {
        // Account created and session ready
        await setActive({ session: result.createdSessionId });
        router.push("/explore");
      }
    } catch (err: unknown) {
      const { message, code } = getErrorMessage(err);
      
      // Handle account already exists - auto sign-in
      if (code === "form_identifier_exists") {
        try {
          // Sign in the existing user
          const signInResult = await signIn.create({
            identifier: trimmedEmail,
          });

          if (signInResult.status === "needs_first_factor") {
            // User exists, prepare email verification
            const emailFactor = signInResult.supportedFirstFactors?.find(
              (factor) => factor.strategy === "email_code"
            );
            
            if (emailFactor && "emailAddressId" in emailFactor) {
              await signIn.prepareFirstFactor({
                strategy: "email_code",
                emailAddressId: emailFactor.emailAddressId,
              });
              setIsSignInFlow(true);
              setShowCodeInput(true);
              setError(""); // Clear the "already exists" message
            } else {
              setError("Email verification is not available for this account. Please try another method.");
            }
          } else if (signInResult.status === "complete" && signInResult.createdSessionId) {
            await setActiveSignIn({ session: signInResult.createdSessionId });
            router.push("/explore");
          }
        } catch (signInErr: unknown) {
          const signInError = getErrorMessage(signInErr);
          setError(signInError.message);
        }
      } else if (isRetryableError(code)) {
        setError(message);
        setClerkLoadError(true);
      } else {
        setError(message);
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, [email, isLoaded, signUp, signInLoaded, signIn, clerkLoadError, setActive, setActiveSignIn, router]);

  // ==========================================================================
  // CODE VERIFICATION HANDLERS
  // ==========================================================================

  const handleCodeSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate code
    const trimmedCode = code.trim();
    if (!trimmedCode || trimmedCode.length !== 6 || !/^\d+$/.test(trimmedCode)) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    
    // Check Clerk readiness
    if (!isLoaded || !signUp || !signInLoaded || !signIn) {
      setError("Authentication service is loading. Please try again.");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSignInFlow) {
        // Verify sign-in email (existing user)
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: trimmedCode,
        });

        if (result.status === "complete" && result.createdSessionId) {
          await setActiveSignIn({ session: result.createdSessionId });
          router.push("/explore");
        } else if (result.status === "needs_second_factor") {
          // Handle 2FA if enabled
          setError("Two-factor authentication is required. Please contact support.");
        } else {
          setError("Verification failed. Please try again.");
        }
      } else {
        // Verify sign-up email (new user)
        const result = await signUp.attemptEmailAddressVerification({ code: trimmedCode });

        if (result.status === "complete" && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          router.push("/explore");
        } else {
          setError("Verification failed. Please try again.");
        }
      }
    } catch (err: unknown) {
      const { message } = getErrorMessage(err);
      setError(message);
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, [code, isLoaded, signUp, signInLoaded, signIn, isSignInFlow, setActive, setActiveSignIn, router]);

  // ==========================================================================
  // RESEND CODE HANDLER
  // ==========================================================================

  const handleResendCode = useCallback(async () => {
    if (!isLoaded || !signUp || !signInLoaded || !signIn) {
      setError("Authentication service is loading. Please try again.");
      return;
    }
    
    setError("");
    
    try {
      if (isSignInFlow) {
        // Resend for sign-in flow
        const emailFactor = signIn.supportedFirstFactors?.find(
          (factor) => factor.strategy === "email_code"
        );

        if (emailFactor && "emailAddressId" in emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
        } else {
          setError("Unable to resend code. Please try again.");
          return;
        }
      } else {
        // Resend for sign-up flow
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
      
      // Show success feedback
      alert("Verification code resent!");
    } catch (err: unknown) {
      const { message } = getErrorMessage(err);
      setError(message);
    }
  }, [isLoaded, signUp, signInLoaded, signIn, isSignInFlow]);

  // ==========================================================================
  // NAVIGATION HANDLERS
  // ==========================================================================

  const handleBack = useCallback(() => {
    if (showCodeInput) {
      setShowCodeInput(false);
      setCode("");
      setError("");
      setIsSignInFlow(false);
    } else if (showEmailInput) {
      setShowEmailInput(false);
      setEmail("");
      setError("");
    }
  }, [showCodeInput, showEmailInput]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  // Show loading while checking auth status
  if (isSignedIn) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <HexwaveLoader message="Already signed in. Redirecting..." size="lg" />
      </div>
    );
  }

  // Show loading state while Clerk initializes
  if (!userLoaded && !clerkLoadError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <HexwaveLoader message="Loading..." size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Side - Video Player */}
      <AuthVideoPlayer />

      {/* Right Side - Sign Up UI */}
      <div className="flex-1 lg:w-1/2 bg-black relative flex items-center justify-center p-8">
        {/* Close Button */}
        <button
          onClick={() => router.push("/explore")}
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Sign Up Content */}
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <AuthHeader mode="sign-up" />

          {/* Clerk Load Error State */}
          {clerkLoadError && !showEmailInput && !showCodeInput && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm mb-3">{error || ERROR_MESSAGES.failed_to_load_clerk_js_timeout}</p>
              <button
                onClick={handleRetry}
                disabled={retryCount >= MAX_RETRY_ATTEMPTS}
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4" />
                {retryCount >= MAX_RETRY_ATTEMPTS ? "Please refresh the page" : "Retry"}
              </button>
            </div>
          )}

          {/* Sign Up Options */}
          {!showEmailInput && !showCodeInput ? (
            <OAuthButtons
              mode="sign-up"
              isLoading={isLoading || clerkLoadError}
              onGoogleClick={() => handleOAuthSignUp("oauth_google")}
              onAppleClick={() => handleOAuthSignUp("oauth_apple")}
              onEmailClick={() => setShowEmailInput(true)}
            />
          ) : showCodeInput ? (
            <CodeVerificationForm
              email={email}
              code={code}
              onCodeChange={setCode}
              onSubmit={handleCodeSubmit}
              onBack={handleBack}
              onResend={handleResendCode}
              isLoading={isLoading}
              isLoaded={isLoaded && signInLoaded}
              error={error}
              isNewAccount={!isSignInFlow}
            />
          ) : (
            <EmailForm
              email={email}
              onEmailChange={setEmail}
              onSubmit={handleEmailSubmit}
              onBack={handleBack}
              isLoading={isLoading}
              isLoaded={isLoaded && signInLoaded}
              error={error}
            />
          )}

          {/* Footer */}
          <AuthFooter
            mode="sign-up"
            onSwitchMode={() => router.push("/sign-in")}
          />
        </div>

        {/* Clerk SignUp component for OAuth SSO callback handling */}
        <div className="hidden">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/explore"
          />
        </div>
      </div>
    </div>
  );
}
