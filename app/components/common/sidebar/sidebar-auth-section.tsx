"use client";

import { LogIn } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useUserStore, selectHasActiveSubscription } from "@/store";
import { useAuthModal } from "@/app/providers/AuthModalProvider";
import { SidebarCreditsDisplay } from "./sidebar-credits-display";
import { SidebarUserMenu } from "./sidebar-user-menu";
import { SidebarUpgradeButton } from "./sidebar-upgrade-button";

export function SidebarAuthSection() {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useAuthModal();
  const hasActiveSubscription = useUserStore(selectHasActiveSubscription);

  if (!isLoaded) return null;

  return (
    <div className="p-2 space-y-1.5 relative">
      {isSignedIn ? (
        <>
          {/* Credits Display - Only show for subscribers */}
          {hasActiveSubscription && <SidebarCreditsDisplay />}

          {/* User Menu */}
          <SidebarUserMenu />
        </>
      ) : (
        <button
          onClick={openSignIn}
          className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors w-full"
          title="Sign In"
        >
          <LogIn className="w-5 h-5 flex-shrink-0" />
          <span className="text-[10px] font-medium text-center leading-tight">
            Sign In
          </span>
        </button>
      )}

      {/* Upgrade Button - Only show if no active subscription */}
      {(!isSignedIn || !hasActiveSubscription) && <SidebarUpgradeButton />}
    </div>
  );
}
