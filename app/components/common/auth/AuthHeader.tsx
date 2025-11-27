"use client";

import { AuthMode } from "./constants";

interface AuthHeaderProps {
  mode: AuthMode;
}

export function AuthHeader({ mode }: AuthHeaderProps) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-serif text-white tracking-tight italic">
        Welcome to Hexwave.ai
      </h1>
      <p className="text-white/60 text-sm mt-2">
        {mode === "sign-up"
          ? "Create an account to get started with AI-powered creative tools"
          : "Sign in to continue your creative journey"}
      </p>
    </div>
  );
}

