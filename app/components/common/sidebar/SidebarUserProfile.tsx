"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface SidebarUserProfileProps {
  variant?: "compact" | "expanded";
}

/**
 * SidebarUserProfile component - Client component
 * Renders the user profile section with avatar
 * 
 * @reasoning Client component needed for Clerk's useUser hook
 * Supports compact (sidebar) and expanded (mobile menu) variants
 * Gracefully handles loading and unauthenticated states
 */
export function SidebarUserProfile({ variant = "compact" }: SidebarUserProfileProps) {
  const { user, isLoaded } = useUser();

  // Don't render until loaded to avoid layout shift
  if (!isLoaded || !user) {
    return null;
  }

  if (variant === "expanded") {
    return (
      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl mb-2">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.fullName || user.emailAddresses[0]?.emailAddress || "User"}
            width={48}
            height={48}
            className="rounded-full border border-white/10"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <User className="w-6 h-6 text-white/70" />
          </div>
        )}
        <div className="flex-1">
          <p className="font-medium text-white">
            {user.fullName || "User"}
          </p>
          <p className="text-sm text-white/60">
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-2 rounded-lg text-white/70">
      <div className="relative group cursor-pointer">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.fullName || user.emailAddresses[0]?.emailAddress || "User"}
            width={24}
            height={24}
            className="w-8 h-8 rounded-full border border-white/10 transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}

