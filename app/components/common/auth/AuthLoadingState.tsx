"use client";

import HexwaveLoader from "@/app/components/common/HexwaveLoader";

// =============================================================================
// TYPES
// =============================================================================

interface AuthLoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Full-screen loading state for auth pages
 */
export function AuthLoadingState({
  message = "Loading...",
  size = "lg",
}: AuthLoadingStateProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <HexwaveLoader message={message} size={size} />
    </div>
  );
}

/**
 * Loading state for when user is already signed in and redirecting
 */
export function AuthRedirectingState() {
  return (
    <AuthLoadingState message="Already signed in. Redirecting..." size="lg" />
  );
}
