"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthVideoPlayer } from "./AuthVideoPlayer";

// =============================================================================
// TYPES
// =============================================================================

interface AuthPageLayoutProps {
  children: React.ReactNode;
  /** Path to navigate to when close button is clicked */
  closePath?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Shared layout for auth pages (sign-in, sign-up)
 * Includes video player on left and content on right
 */
export function AuthPageLayout({
  children,
  closePath = "/explore",
}: AuthPageLayoutProps) {
  const router = useRouter();

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Side - Video Player */}
      <AuthVideoPlayer />

      {/* Right Side - Auth UI */}
      <div className="flex-1 lg:w-1/2 bg-black relative flex items-center justify-center p-8">
        {/* Close Button */}
        <button
          onClick={() => router.push(closePath)}
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Content */}
        <div className="w-full max-w-md space-y-6">{children}</div>
      </div>
    </div>
  );
}
