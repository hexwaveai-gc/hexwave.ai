"use client";

import Link from "next/link";
import { LogIn, LogOut, ChevronRight } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

interface SidebarAuthSectionProps {
  variant?: "compact" | "expanded";
  onClose?: () => void;
}

/**
 * SidebarAuthSection component - Client component
 * Renders authentication controls (sign in/sign out)
 * 
 * @reasoning Client component needed for Clerk hooks and sign out functionality
 * Supports compact (sidebar) and expanded (mobile menu) variants
 * Shows loading state gracefully
 */
export function SidebarAuthSection({ variant = "compact", onClose }: SidebarAuthSectionProps) {
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Don't render until auth state is loaded
  if (!isLoaded) {
    return null;
  }

  const handleSignOut = () => {
    if (onClose) {
      onClose();
    }
    signOut({ redirectUrl: '/explore' });
  };

  if (variant === "expanded") {
    return isSignedIn ? (
      <button
        onClick={handleSignOut}
        className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <LogOut className="w-5 h-5 text-white/70" />
          <span className="text-white">Sign Out</span>
        </div>
        <ChevronRight className="w-5 h-5 text-white/40" />
      </button>
    ) : (
      <Link
        href="/sign-in"
        onClick={onClose}
        className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <LogIn className="w-5 h-5 text-white/70" />
          <span className="text-white">Sign In</span>
        </div>
        <ChevronRight className="w-5 h-5 text-white/40" />
      </Link>
    );
  }

  return isSignedIn ? (
    <button
      onClick={handleSignOut}
      className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors w-full"
      title="Sign Out"
    >
      <LogOut className="w-5 h-5 shrink-0" />
    </button>
  ) : (
    <Link
      href="/sign-in"
      className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
      title="Sign In"
    >
      <LogIn className="w-5 h-5 shrink-0" />
    </Link>
  );
}


