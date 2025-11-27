"use client";

import { SignIn, SignUp, useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import HexwaveLoader from "@/app/components/common/HexwaveLoader";
import {
  AuthVideoPlayer,
  OAuthButtons,
  EmailForm,
  CodeVerificationForm,
  AuthFooter,
  AuthHeader,
} from "@/app/components/common/auth";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded, setActive: setActiveSignUp } = useSignUp();
  const { isSignedIn } = useUser();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUpFlow, setIsSignUpFlow] = useState(false);

  // Handle OAuth sign-in (supports both sign-in and auto sign-up)
  const handleOAuthSignIn = async (strategy: "oauth_google" | "oauth_apple") => {
    if (isLoading) return;
    
    if (!isLoaded || !signIn || !signUpLoaded || !signUp) {
      setError("Authentication service is not ready. Please refresh the page.");
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
      // If sign-in fails (user doesn't exist), try sign-up
      try {
        await signUp.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sign-up/sso-callback",
          redirectUrlComplete: "/explore",
        });
      } catch (signUpErr: unknown) {
        const error = signUpErr as { errors?: Array<{ message?: string }> } | Error;
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(error.errors?.[0]?.message || "Failed to authenticate. Please try again.");
        }
        setIsLoading(false);
      }
    }
  };

  // Check if user is already signed in - redirect to explore
  useEffect(() => {
    if (isSignedIn) {
      router.replace("/explore");
    }
  }, [isSignedIn, router]);

  // Check if we're in email verification flow
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam && signIn?.status === "needs_first_factor") {
      setEmail(emailParam);
      setShowEmailInput(true);
      setShowCodeInput(true);
    }
  }, [searchParams, signIn?.status]);

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!isLoaded || !signIn || !signUpLoaded || !signUp) {
      setError("Authentication service is loading. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      // First, try to sign in
      const result = await signIn.create({
        identifier: email.trim().toLowerCase(),
      });

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
          setError("Email verification is not available. Please try another method.");
        }
      } else if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.push("/explore");
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message?: string; code?: string }> };
      const errorCode = error.errors?.[0]?.code;
      
      // If user doesn't exist, automatically create account
      if (errorCode === "form_identifier_not_found") {
        try {
          const signUpResult = await signUp.create({
            emailAddress: email.trim().toLowerCase(),
          });

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
          const signUpError = signUpErr as { errors?: Array<{ message?: string }> };
          setError(signUpError.errors?.[0]?.message || "Failed to create account. Please try again.");
        }
      } else {
        setError(error.errors?.[0]?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email code verification
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    
    if (!isLoaded || !signIn || !signUpLoaded || !signUp) {
      setError("Authentication service is loading. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUpFlow) {
        const result = await signUp.attemptEmailAddressVerification({ code });

        if (result.status === "complete" && result.createdSessionId) {
          await setActiveSignUp({ session: result.createdSessionId });
          router.push("/explore");
        } else {
          setError("Verification failed. Please try again.");
        }
      } else {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });

        if (result.status === "complete" && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
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
    if (isSignUpFlow && signUp && signUpLoaded) {
      try {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setError("");
        alert("Verification code resent!");
      } catch (err: unknown) {
        const error = err as { errors?: Array<{ message?: string }> };
        setError(error.errors?.[0]?.message || "Failed to resend code");
      }
    } else if (!isSignUpFlow && signIn && isLoaded) {
      try {
        const emailFactor = signIn.supportedFirstFactors?.find(
          (factor) => factor.strategy === "email_code"
        );

        if (emailFactor && "emailAddressId" in emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
          setError("");
          alert("Verification code resent!");
        }
      } catch (err: unknown) {
        const error = err as { errors?: Array<{ message?: string }> };
        setError(error.errors?.[0]?.message || "Failed to resend code");
      }
    }
  };

  // Show loading while checking auth status
  if (isSignedIn) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <HexwaveLoader message="Already signed in. Redirecting..." size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Side - Video Player */}
      <AuthVideoPlayer />

      {/* Right Side - Sign In UI */}
      <div className="flex-1 lg:w-1/2 bg-black relative flex items-center justify-center p-8">
        {/* Close Button */}
        <button
          onClick={() => router.push("/explore")}
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Sign In Content */}
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <AuthHeader mode="sign-in" />

          {/* Sign In Options */}
            {!showEmailInput && !showCodeInput ? (
            <OAuthButtons
              mode="sign-in"
              isLoading={isLoading}
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
          <AuthFooter
            mode="sign-in"
            onSwitchMode={() => router.push("/sign-up")}
          />
        </div>

        {/* Clerk components for OAuth SSO callback handling */}
        <div className="hidden">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/explore"
          />
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
