"use client";

import { SignIn, SignUp, useSignIn, useSignUp } from "@clerk/nextjs";
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

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded, setActive: setActiveSignUp } = useSignUp();

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
      if (!isLoaded || !signUpLoaded) {
        setClerkLoadError(true);
        setError(AUTH_ERROR_MESSAGES.failed_to_load_clerk_js_timeout);
      }
    }, CLERK_LOAD_TIMEOUT);

    if (isLoaded && signUpLoaded) {
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
  }, [isLoaded, signUpLoaded, error, setClerkLoadError, setError]);

  // Check for email verification flow from URL params
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam && signIn?.status === "needs_first_factor") {
      setEmail(emailParam);
      setShowEmailInput(true);
      setShowCodeInput(true);
    }
  }, [searchParams, signIn?.status, setEmail, setShowEmailInput, setShowCodeInput]);

  // ==========================================================================
  // OAUTH HANDLER
  // ==========================================================================

  const handleOAuthSignIn = useCallback(
    async (strategy: "oauth_google" | "oauth_apple") => {
      if (isLoading) return;

      if (!isLoaded || !signIn || !signUpLoaded || !signUp) {
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
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sign-in/sso-callback",
          redirectUrlComplete: "/explore",
        });
      } catch {
        try {
          await signUp.authenticateWithRedirect({
            strategy,
            redirectUrl: "/sign-up/sso-callback",
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
    [isLoading, isLoaded, signIn, signUpLoaded, signUp, clerkLoadError, setIsLoading, setError, setClerkLoadError]
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

      if (!isLoaded || !signIn || !signUpLoaded || !signUp) {
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
        const result = await signIn.create({ identifier: trimmedEmail });

        if (result.status === "needs_first_factor") {
          const emailFactor = result.supportedFirstFactors?.find(
            (factor) => factor.strategy === "email_code"
          );

          if (emailFactor && "emailAddressId" in emailFactor) {
            await signIn.prepareFirstFactor({
              strategy: "email_code",
              emailAddressId: emailFactor.emailAddressId,
            });
            setIsSignUpFlow(false);
            setShowCodeInput(true);
          } else {
            setError("Email verification is not available for this account.");
          }
        } else if (result.status === "complete" && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          router.push("/explore");
        }
      } catch (err: unknown) {
        const { message, code } = getErrorMessage(err);

        if (code === "form_identifier_not_found") {
          // Auto create account for new user
          try {
            const signUpResult = await signUp.create({ emailAddress: trimmedEmail });

            if (signUpResult.status === "missing_requirements") {
              await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
              setIsSignUpFlow(true);
              setShowCodeInput(true);
              setError("");
            } else if (signUpResult.status === "complete" && signUpResult.createdSessionId) {
              await setActiveSignUp({ session: signUpResult.createdSessionId });
              router.push("/explore");
            }
          } catch (signUpErr: unknown) {
            const signUpError = getErrorMessage(signUpErr);

            if (signUpError.code === "form_identifier_exists") {
              // Race condition - retry sign-in
              try {
                const retryResult = await signIn.create({ identifier: trimmedEmail });

                if (retryResult.status === "needs_first_factor") {
                  const emailFactor = retryResult.supportedFirstFactors?.find(
                    (factor) => factor.strategy === "email_code"
                  );

                  if (emailFactor && "emailAddressId" in emailFactor) {
                    await signIn.prepareFirstFactor({
                      strategy: "email_code",
                      emailAddressId: emailFactor.emailAddressId,
                    });
                    setIsSignUpFlow(false);
                    setShowCodeInput(true);
                  }
                }
              } catch {
                setError("Failed to authenticate. Please try again.");
              }
            } else {
              setError(signUpError.message);
            }
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
      signIn,
      signUpLoaded,
      signUp,
      clerkLoadError,
      setActive,
      setActiveSignUp,
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

      if (!isLoaded || !signIn || !signUpLoaded || !signUp) {
        setError("Authentication service is loading. Please try again.");
        return;
      }

      setIsLoading(true);
      const trimmedCode = code.trim();

      try {
        if (isSignUpFlow) {
          const result = await signUp.attemptEmailAddressVerification({ code: trimmedCode });
          if (result.status === "complete" && result.createdSessionId) {
            await setActiveSignUp({ session: result.createdSessionId });
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
            await setActive({ session: result.createdSessionId });
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
    [code, isLoaded, signIn, signUpLoaded, signUp, isSignUpFlow, setActive, setActiveSignUp, router, mounted, setError, setIsLoading]
  );

  // ==========================================================================
  // RESEND CODE HANDLER
  // ==========================================================================

  const handleResendCode = useCallback(async () => {
    if (!isLoaded || !signIn || !signUpLoaded || !signUp) {
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
  }, [isLoaded, signIn, signUpLoaded, signUp, isSignUpFlow, setError]);

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
      <AuthHeader mode="sign-in" />

      {/* Clerk Load Error State */}
      {clerkLoadError && !showEmailInput && !showCodeInput && (
        <ClerkErrorState error={error} retryCount={retryCount} onRetry={handleRetry} />
      )}

      {/* Sign In Options */}
      {!showEmailInput && !showCodeInput ? (
        <OAuthButtons
          mode="sign-in"
          isLoading={isLoading || clerkLoadError}
          onGoogleClick={() => handleOAuthSignIn("oauth_google")}
          onAppleClick={() => handleOAuthSignIn("oauth_apple")}
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
          isLoaded={isLoaded && signUpLoaded}
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
          isLoaded={isLoaded && signUpLoaded}
          error={error}
        />
      )}

      {/* Footer */}
      <AuthFooter mode="sign-in" onSwitchMode={() => router.push("/sign-up")} />

      {/* Hidden Clerk components for OAuth SSO callback handling */}
      <div className="hidden">
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/explore" />
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/explore" />
      </div>
    </AuthPageLayout>
  );
}
