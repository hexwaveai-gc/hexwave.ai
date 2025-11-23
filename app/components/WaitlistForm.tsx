"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      setIsSuccess(true);
      setEmail("");
    } catch (error) {
      console.error("Waitlist signup error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to join waitlist"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-start text-left space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#4bde81] dark:text-green-400" />
          <h3 className="text-base font-semibold text-white dark:text-gray-100">
            You're on the list! 🎉
          </h3>
        </div>
        <p className="text-sm text-white/60 dark:text-gray-400">
          Thanks for joining our waitlist. We'll notify you when we launch!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 dark:text-gray-500 w-4 h-4 pointer-events-none" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={isSubmitting}
            className={`pl-10 bg-white/5 dark:bg-gray-800/50 border-white/10 dark:border-gray-700 text-white dark:text-gray-100 placeholder:text-white/40 dark:placeholder:text-gray-500 focus-visible:ring-white/20 dark:focus-visible:ring-gray-600 ${
              error ? "border-red-500/50 focus-visible:border-red-500/50" : ""
            }`}
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="tf-primary"
          className="shrink-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Joining...
            </>
          ) : (
            "Join Waitlist"
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-400 dark:text-red-300">{error}</p>
      )}
      <p className="text-xs text-white/40 dark:text-gray-500">
        We'll only send you updates about the launch. No spam, ever.
      </p>
    </form>
  );
}

