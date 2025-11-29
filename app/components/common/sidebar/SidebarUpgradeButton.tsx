"use client";

import Link from "next/link";
import { Zap, Coins, Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useUpgradePlan } from "@/app/providers/UpgradePlanProvider";
import { useAuthModal } from "@/app/providers/AuthModalProvider";
import { useUserStore, selectCredits, selectHasActiveSubscription, selectPlanName } from "@/store";

// Threshold for showing "Add Credits" button
const LOW_CREDITS_THRESHOLD = 2000;

interface SidebarUpgradeButtonProps {
  variant?: "compact" | "expanded";
  onClose?: () => void;
}

/**
 * SidebarUpgradeButton component - Client component
 * Renders either the upgrade button OR credits display based on subscription status
 * 
 * @reasoning 
 * - Shows credits display if user has active subscription
 * - Shows "Add Credits" button if credits < 2000 (opens credits modal)
 * - Shows upgrade button if user is signed in but no subscription
 * - Shows "Get Started" button if user is not signed in
 */
export function SidebarUpgradeButton({ variant = "compact", onClose }: SidebarUpgradeButtonProps) {
  const { isSignedIn } = useUser();
  const { openModal } = useUpgradePlan();
  const { openSignIn } = useAuthModal();
  
  // User store selectors
  const credits = useUserStore(selectCredits);
  const hasActiveSubscription = useUserStore(selectHasActiveSubscription);
  const planName = useUserStore(selectPlanName);

  // Check if credits are low
  const isLowCredits = credits < LOW_CREDITS_THRESHOLD;

  // Format credits for display
  const formatCredits = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  const handleUpgradeClick = () => {
    if (onClose) onClose();
    openModal();
  };

  const handleAddCreditsClick = () => {
    if (onClose) onClose();
    openModal(); // Opens modal, which defaults to credits tab for subscribers
  };

  const handleSignInClick = () => {
    if (onClose) onClose();
    openSignIn();
  };

  // If user has active subscription, show credits display + optional Add Credits button
  if (isSignedIn && hasActiveSubscription) {
    if (variant === "expanded") {
      return (
        <div className="space-y-2">
          {/* Credits Display */}
          <Link
            href="/billing"
            onClick={onClose}
            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-[#74FF52]" />
              <div>
                <span className={`font-semibold ${isLowCredits ? "text-yellow-500" : "text-[#74FF52]"}`}>
                  {formatCredits(credits)} credits
                </span>
                <p className="text-xs text-white/50">{planName}</p>
              </div>
            </div>
          </Link>
          
          {/* Add Credits Button - Show when credits are low */}
          {isLowCredits && (
            <button
              onClick={handleAddCreditsClick}
              className="flex items-center justify-between w-full p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-500 font-medium">Add Credits</span>
              </div>
            </button>
          )}
        </div>
      );
    }

    // Compact variant for sidebar
    return (
      <div className="space-y-2 w-full">
        {/* Credits Display */}
        <Link
          href="/billing"
          className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors w-full ${
            isLowCredits ? "border border-yellow-500/30" : ""
          }`}
          title={`${credits.toLocaleString()} credits available`}
        >
          <Coins className={`w-5 h-5 flex-shrink-0 ${isLowCredits ? "text-yellow-500" : "text-[#74FF52]"}`} />
          <span className={`text-[10px] font-semibold text-center leading-tight ${isLowCredits ? "text-yellow-500" : "text-[#74FF52]"}`}>
            {formatCredits(credits)}
          </span>
          <span className="text-[8px] text-white/50 leading-tight">
            {planName}
          </span>
        </Link>
        
        {/* Add Credits Button - Show when credits are low */}
        {isLowCredits && (
          <button
            onClick={handleAddCreditsClick}
            className="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/30 transition-all font-semibold w-full group"
            title="Add more credits"
          >
            <Plus className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            <span className="text-[8px] text-center leading-tight">Add Credits</span>
          </button>
        )}
      </div>
    );
  }

  // Expanded variant (mobile menu)
  if (variant === "expanded") {
    if (isSignedIn) {
      return (
        <button
          onClick={handleUpgradeClick}
          className="flex items-center justify-between p-4 bg-[#74FF52] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#66e648] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5" />
            <span>Upgrade to Pro</span>
          </div>
        </button>
      );
    }

    return (
      <button
        onClick={handleSignInClick}
        className="flex items-center justify-between p-4 bg-[#74FF52] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#66e648] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5" />
          <span>Get Started</span>
        </div>
      </button>
    );
  }

  // Compact variant (sidebar) - signed in without subscription
  if (isSignedIn) {
    return (
      <Link
        href="/pricing"
        className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-[#74FF52] text-[#0a0a0a] hover:bg-[#66e648] hover:shadow-[0_0_15px_rgba(116,255,82,0.4)] transition-all font-semibold w-full group"
        title="Upgrade Plan"
      >
        <Zap className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
        <span className="text-[9px] text-center leading-tight">Upgrade</span>
      </Link>
    );
  }

  // Compact variant (sidebar) - not signed in
  return (
    <button
      onClick={handleSignInClick}
      className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-[#74FF52] text-[#0a0a0a] hover:bg-[#66e648] hover:shadow-[0_0_15px_rgba(116,255,82,0.4)] transition-all font-semibold w-full group"
      title="Get Started"
    >
      <Zap className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
      <span className="text-[9px] text-center leading-tight">Get Started</span>
    </button>
  );
}

