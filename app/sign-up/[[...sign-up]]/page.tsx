"use client";

import { useSignUp, useSignIn, SignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback, useRef } from "react";

// Shared components
import {
  OAuthButtons,
  EmailForm,
  CodeVerificationForm,
  AuthFooter,
  AuthHeader,
  AuthLoadingState,
  AuthRedirectingState,
  ClerkErrorState,
  AuthPageLayout,
  CLERK_LOAD_TIMEOUT,
  AUTH_ERROR_MESSAGES,
} from "@/app/components/common/auth";

// Shared hooks and helpers
import { useAuthFlow } from "@/hooks/use-auth-flow";
import { getErrorMessage, isRetryableError, validateEmail, normalizeEmail, validateCode } from "@/lib/auth";

// =============================================================================
// COMPONENT
// =============================================================================

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();

  // Use shared auth flow hook
  const {
    email,
    code,
    showEmailInput,
    showCodeInput,
    isLoading,
    error,
    isSignUpFlow,
    clerkLoadError,
    retryCount,
    setEmail,
    setCode,
    setShowEmailInput,
    setShowCodeInput,
    setIsLoading,
    setError,
    setIsSignUpFlow,
    setClerkLoadError,
    handleBack,
    handleRetry,
    mounted,
    isSignedIn,
    userLoaded,
  } = useAuthFlow({ redirectTo: "/explore" });

  // Clerk loading timeout ref
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================================================
  // CLERK LOADING MONITORING
  // ==========================================================================

  useEffect(() => {
    loadTimeoutRef.current = setTimeout(() => {
      if (!isLoaded || !signInLoaded) {
        setClerkLoadError(true);
        setError(AUTH_ERROR_MESSAGES.failed_to_load_clerk_js_timeout);
      }
    }, CLERK_LOAD_TIMEOUT);

    if (isLoaded && signInLoaded) {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      setClerkLoadError(false);
      if (error === AUTH_ERROR_MESSAGES.failed_to_load_clerk_js_timeout) {
        setError("");
      }
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isLoaded, signInLoaded, error, setClerkLoadError, setError]);

  // Check for email verification flow from URL params
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam && signUp?.status === "missing_requirements") {
      setEmail(emailParam);
      setShowEmailInput(true);
      setShowCodeInput(true);
    }
  }, [searchParams, signUp?.status, setEmail, setShowEmailInput, setShowCodeInput]);

  // ==========================================================================
  // OAUTH HANDLER
  // ==========================================================================

  const handleOAuthSignUp = useCallback(
    async (strategy: "oauth_google" | "oauth_apple") => {
      if (isLoading) return;

      if (!isLoaded || !signUp || !signInLoaded || !signIn) {
        setError(
          clerkLoadError
            ? AUTH_ERROR_MESSAGES.failed_to_load_clerk_js_timeout
            : "Authentication service is loading. Please wait..."
        );
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        await signUp.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sign-up/sso-callback",
          redirectUrlComplete: "/explore",
        });
      } catch {
        try {
          await signIn.authenticateWithRedirect({
            strategy,
            redirectUrl: "/sign-in/sso-callback",
            redirectUrlComplete: "/explore",
          });
        } catch (err: unknown) {
          const { message, code } = getErrorMessage(err);
          setError(message);
          if (isRetryableError(code)) {
            setClerkLoadError(true);
          }
          setIsLoading(false);
        }
      }
    },
    [isLoading, isLoaded, signUp, signInLoaded, signIn, clerkLoadError, setIsLoading, setError, setClerkLoadError]
  );

  // ==========================================================================
  // EMAIL HANDLER
  // ==========================================================================

  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      const validation = validateEmail(email);
      if (!validation.isValid) {
        setError(validation.error!);
        return;
      }

      if (!isLoaded || !signUp || !signInLoaded || !signIn) {
        setError(
          clerkLoadError
            ? AUTH_ERROR_MESSAGES.failed_to_load_clerk_js_timeout
            : "Authentication service is loading. Please wait..."
        );
        return;
      }

      setIsLoading(true);
      const trimmedEmail = normalizeEmail(email);

      try {
        const result = await signUp.create({ emailAddress: trimmedEmail });

        if (result.status === "missing_requirements") {
          await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
          setIsSignUpFlow(true);
          setShowCodeInput(true);
        } else if (result.status === "complete" && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          router.push("/explore");
        }
      } catch (err: unknown) {
        const { message, code } = getErrorMessage(err);

        if (code === "form_identifier_exists") {
          // Auto sign-in existing user
          try {
            const signInResult = await signIn.create({ identifier: trimmedEmail });

            if (signInResult.status === "needs_first_factor") {
              const emailFactor = signInResult.supportedFirstFactors?.find(
                (factor) => factor.strategy === "email_code"
              );

              if (emailFactor && "emailAddressId" in emailFactor) {
                await signIn.prepareFirstFactor({
                  strategy: "email_code",
                  emailAddressId: emailFactor.emailAddressId,
                });
                setIsSignUpFlow(false);
                setShowCodeInput(true);
                setError("");
              } else {
                setError("Email verification is not available for this account.");
              }
            } else if (signInResult.status === "complete" && signInResult.createdSessionId) {
              await setActiveSignIn({ session: signInResult.createdSessionId });
              router.push("/explore");
            }
          } catch (signInErr: unknown) {
            setError(getErrorMessage(signInErr).message);
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
    },
    [
      email,
      isLoaded,
      signUp,
      signInLoaded,
      signIn,
      clerkLoadError,
      setActive,
      setActiveSignIn,
      router,
      mounted,
      setError,
      setIsLoading,
      setIsSignUpFlow,
      setShowCodeInput,
      setClerkLoadError,
    ]
  );

  // ==========================================================================
  // CODE VERIFICATION HANDLER
  // ==========================================================================

  const handleCodeSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      const validation = validateCode(code);
      if (!validation.isValid) {
        setError(validation.error!);
        return;
      }

      if (!isLoaded || !signUp || !signInLoaded || !signIn) {
        setError("Authentication service is loading. Please try again.");
        return;
      }

      setIsLoading(true);
      const trimmedCode = code.trim();

      try {
        if (isSignUpFlow) {
          const result = await signUp.attemptEmailAddressVerification({ code: trimmedCode });
          if (result.status === "complete" && result.createdSessionId) {
            await setActive({ session: result.createdSessionId });
            router.push("/explore");
          } else {
            setError("Verification failed. Please try again.");
          }
        } else {
          const result = await signIn.attemptFirstFactor({
            strategy: "email_code",
            code: trimmedCode,
          });

          if (result.status === "complete" && result.createdSessionId) {
            await setActiveSignIn({ session: result.createdSessionId });
            router.push("/explore");
          } else if (result.status === "needs_second_factor") {
            setError("Two-factor authentication is required. Please contact support.");
          } else {
            setError("Verification failed. Please try again.");
          }
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err).message);
      } finally {
        if (mounted.current) {
          setIsLoading(false);
        }
      }
    },
    [code, isLoaded, signUp, signInLoaded, signIn, isSignUpFlow, setActive, setActiveSignIn, router, mounted, setError, setIsLoading]
  );

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
      if (isSignUpFlow) {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } else {
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
      }
      alert("Verification code resent!");
    } catch (err: unknown) {
      setError(getErrorMessage(err).message);
    }
  }, [isLoaded, signUp, signInLoaded, signIn, isSignUpFlow, setError]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (isSignedIn) {
    return <AuthRedirectingState />;
  }

  if (!userLoaded && !clerkLoadError) {
    return <AuthLoadingState />;
  }

  return (
    <AuthPageLayout>
      {/* Header */}
      <AuthHeader mode="sign-up" />

      {/* Clerk Load Error State */}
      {clerkLoadError && !showEmailInput && !showCodeInput && (
        <ClerkErrorState error={error} retryCount={retryCount} onRetry={handleRetry} />
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
          isNewAccount={isSignUpFlow}
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
      <AuthFooter mode="sign-up" onSwitchMode={() => router.push("/sign-in")} />

      {/* Hidden Clerk component for OAuth SSO callback handling */}
      <div className="hidden">
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/explore" />
      </div>
    </AuthPageLayout>
  );
}
