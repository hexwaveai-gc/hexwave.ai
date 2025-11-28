"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignUp, useSignIn, useUser, SignUp, SignIn } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  AuthVideoPlayer,
  OAuthButtons,
  EmailForm,
  CodeVerificationForm,
  AuthFooter,
  AuthHeader,
  AuthMode,
} from "./auth";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
}

export default function AuthModal({
  open,
  onOpenChange,
  initialMode = "sign-up",
  onModeChange,
}: AuthModalProps) {
  const router = useRouter();
  const { signUp, setActive: setActiveSignUp, isLoaded: isSignUpLoaded } = useSignUp();
  const { signIn, setActive: setActiveSignIn, isLoaded: isSignInLoaded } = useSignIn();
  const { isSignedIn } = useUser();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUpFlow, setIsSignUpFlow] = useState(false);

  const isLoaded = isSignUpLoaded && isSignInLoaded;

  // Sync mode with initialMode prop
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Close modal if user signs in
  useEffect(() => {
    if (isSignedIn && open) {
      onOpenChange(false);
      router.push("/explore");
    }
  }, [isSignedIn, open, onOpenChange, router]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setEmail("");
      setCode("");
      setShowEmailInput(false);
      setShowCodeInput(false);
      setError("");
      setIsSignUpFlow(false);
    }
  }, [open]);

  // Handle mode switch
  const handleSwitchMode = () => {
    const newMode = mode === "sign-up" ? "sign-in" : "sign-up";
    setMode(newMode);
    onModeChange?.(newMode);
    // Reset form state
    setEmail("");
    setCode("");
    setShowEmailInput(false);
    setShowCodeInput(false);
    setError("");
    setIsSignUpFlow(false);
  };

  // Handle OAuth
  const handleOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (isLoading || !isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      if (mode === "sign-up") {
        await signUp?.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sign-up/sso-callback",
          redirectUrlComplete: "/explore",
        });
      } else {
        // Sign-in flow - try sign-in first, fall back to sign-up
        try {
          await signIn?.authenticateWithRedirect({
            strategy,
            redirectUrl: "/sign-in/sso-callback",
            redirectUrlComplete: "/explore",
          });
        } catch {
          // If sign-in fails, try sign-up
          await signUp?.authenticateWithRedirect({
            strategy,
            redirectUrl: "/sign-up/sso-callback",
            redirectUrlComplete: "/explore",
          });
        }
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message?: string }> } | Error;
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(error.errors?.[0]?.message || "Authentication failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isLoaded) {
      setError("Authentication service is loading. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "sign-up") {
        // Sign-up flow
        const result = await signUp?.create({
          emailAddress: email.trim().toLowerCase(),
        });

        if (result?.status === "missing_requirements") {
          await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
          setIsSignUpFlow(true);
          setShowCodeInput(true);
        } else if (result?.status === "complete" && result.createdSessionId) {
          await setActiveSignUp?.({ session: result.createdSessionId });
          onOpenChange(false);
          router.push("/explore");
        }
      } else {
        // Sign-in flow - try sign-in first
        try {
          const result = await signIn?.create({
            identifier: email.trim().toLowerCase(),
          });

          if (result?.status === "needs_first_factor") {
            const emailFactor = result.supportedFirstFactors?.find(
              (factor) => factor.strategy === "email_code"
            );

            if (emailFactor && "emailAddressId" in emailFactor) {
              await signIn?.prepareFirstFactor({
                strategy: "email_code",
                emailAddressId: emailFactor.emailAddressId,
              });
              setIsSignUpFlow(false);
              setShowCodeInput(true);
            } else {
              setError("Email verification is not available. Please try another method.");
            }
          } else if (result?.status === "complete" && result.createdSessionId) {
            await setActiveSignIn?.({ session: result.createdSessionId });
            onOpenChange(false);
            router.push("/explore");
          }
        } catch (err: unknown) {
          const error = err as { errors?: Array<{ message?: string; code?: string }> };
          const errorCode = error.errors?.[0]?.code;

          // If user doesn't exist, auto-create account
          if (errorCode === "form_identifier_not_found") {
            const signUpResult = await signUp?.create({
              emailAddress: email.trim().toLowerCase(),
            });

            if (signUpResult?.status === "missing_requirements") {
              await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
              setIsSignUpFlow(true);
              setShowCodeInput(true);
              setError("");
            } else if (signUpResult?.status === "complete" && signUpResult.createdSessionId) {
              await setActiveSignUp?.({ session: signUpResult.createdSessionId });
              onOpenChange(false);
              router.push("/explore");
            }
          } else {
            setError(error.errors?.[0]?.message || "Something went wrong. Please try again.");
          }
        }
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message?: string; code?: string }> };
      const errorCode = error.errors?.[0]?.code;

      if (errorCode === "form_identifier_exists") {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(error.errors?.[0]?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code verification
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    if (!isLoaded) {
      setError("Authentication service is loading. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUpFlow) {
        const result = await signUp?.attemptEmailAddressVerification({ code });

        if (result?.status === "complete" && result.createdSessionId) {
          await setActiveSignUp?.({ session: result.createdSessionId });
          onOpenChange(false);
          router.push("/explore");
        } else {
          setError("Verification failed. Please try again.");
        }
      } else {
        const result = await signIn?.attemptFirstFactor({
          strategy: "email_code",
          code,
        });

        if (result?.status === "complete" && result.createdSessionId) {
          await setActiveSignIn?.({ session: result.createdSessionId });
          onOpenChange(false);
          router.push("/explore");
        } else {
          setError("Verification failed. Please try again.");
        }
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message?: string; code?: string }> };
      const errorCode = error.errors?.[0]?.code;

      if (errorCode === "form_code_incorrect") {
        setError("Invalid verification code. Please check and try again.");
      } else if (errorCode === "form_code_expired") {
        setError("Verification code has expired. Please request a new one.");
      } else {
        setError(error.errors?.[0]?.message || "Invalid code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (!isLoaded) return;

    try {
      if (isSignUpFlow) {
        await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
      } else {
        const emailFactor = signIn?.supportedFirstFactors?.find(
          (factor) => factor.strategy === "email_code"
        );

        if (emailFactor && "emailAddressId" in emailFactor) {
          await signIn?.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
        }
      }
      setError("");
      alert("Verification code resent!");
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message?: string }> };
      setError(error.errors?.[0]?.message || "Failed to resend code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] max-h-[700px] bg-black border-white/10 text-white p-0 flex overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:top-4 [&>button]:right-4 [&>button]:z-20">
        <DialogHeader className="sr-only">
          <DialogTitle>{mode === "sign-up" ? "Sign Up" : "Sign In"}</DialogTitle>
        </DialogHeader>

        {/* Left Side - Video Player */}
        <AuthVideoPlayer isActive={open} />

        {/* Right Side - Auth UI */}
        <div className="flex-1 lg:w-1/2 bg-black relative flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Header */}
            <AuthHeader mode={mode} />

            {/* Auth Options */}
            {!showEmailInput && !showCodeInput ? (
              <OAuthButtons
                mode={mode}
                isLoading={isLoading}
                onGoogleClick={() => handleOAuth("oauth_google")}
                onAppleClick={() => handleOAuth("oauth_apple")}
                onEmailClick={() => setShowEmailInput(true)}
              />
            ) : showCodeInput ? (
              <CodeVerificationForm
                email={email}
                code={code}
                onCodeChange={setCode}
                onSubmit={handleCodeSubmit}
                onBack={() => {
                  setShowCodeInput(false);
                  setCode("");
                  setError("");
                }}
                onResend={handleResendCode}
                isLoading={isLoading}
                isLoaded={isLoaded}
                error={error}
                isNewAccount={isSignUpFlow}
              />
            ) : (
              <EmailForm
                email={email}
                onEmailChange={setEmail}
                onSubmit={handleEmailSubmit}
                onBack={() => {
                  setShowEmailInput(false);
                  setEmail("");
                  setError("");
                }}
                isLoading={isLoading}
                isLoaded={isLoaded}
                error={error}
              />
            )}

            {/* Footer */}
            <AuthFooter mode={mode} onSwitchMode={handleSwitchMode} />
          </div>

          {/* Hidden Clerk components for OAuth callback handling */}
          <div className="hidden">
            <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/explore" />
            <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/explore" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


