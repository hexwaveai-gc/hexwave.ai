"use client";

import { useSignUp, useUser, SignUp } from "@clerk/nextjs";
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
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn } = useUser();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle OAuth sign-up
  const handleOAuthSignUp = async (strategy: "oauth_google" | "oauth_apple") => {
    if (isLoading) return;
    
    if (!isLoaded || !signUp) {
      setError("Authentication service is not ready. Please refresh the page.");
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
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message?: string }> } | Error;
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(error.errors?.[0]?.message || "Failed to sign up. Please try again.");
      }
      setIsLoading(false);
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
    if (emailParam && signUp?.status === "missing_requirements") {
      setEmail(emailParam);
      setShowEmailInput(true);
      setShowCodeInput(true);
    }
  }, [searchParams, signUp?.status]);

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!isLoaded || !signUp) {
      setError("Authentication service is loading. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: email.trim().toLowerCase(),
      });

      if (result.status === "missing_requirements") {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setShowCodeInput(true);
      } else if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.push("/explore");
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

  // Handle email code verification
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    
    if (!isLoaded || !signUp) {
      setError("Authentication service is loading. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.push("/explore");
      } else {
        setError("Verification failed. Please try again.");
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
    if (signUp && isLoaded) {
      try {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setError("");
        alert("Verification code resent!");
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

          {/* Sign Up Options */}
            {!showEmailInput && !showCodeInput ? (
            <OAuthButtons
              mode="sign-up"
              isLoading={isLoading}
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
              onBack={() => {
                setShowCodeInput(false);
                setCode("");
                setError("");
              }}
              onResend={handleResendCode}
              isLoading={isLoading}
              isLoaded={isLoaded}
              error={error}
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
