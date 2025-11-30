"use client";

import Link from "next/link";
import { Coins, Plus } from "lucide-react";
import { useUserStore, selectCredits, selectPlanName } from "@/store";
import { useUpgradePlan } from "@/app/providers/UpgradePlanProvider";
import { LOW_CREDITS_THRESHOLD } from "./constants";

// Format credits for display
function formatCredits(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toString();
}

export function SidebarCreditsDisplay() {
  const credits = useUserStore(selectCredits);
  const planName = useUserStore(selectPlanName);
  const { openModal: openUpgradeModal } = useUpgradePlan();

  const isLowCredits = credits < LOW_CREDITS_THRESHOLD;

  return (
    <>
      <Link
        href="/billing"
        className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors ${
          isLowCredits ? "border border-yellow-500/30" : ""
        }`}
        title={`${credits.toLocaleString()} credits available`}
      >
        <Coins
          className={`w-5 h-5 flex-shrink-0 ${
            isLowCredits ? "text-yellow-500" : "text-[#74FF52]"
          }`}
        />
        <span
          className={`text-[10px] font-semibold text-center leading-tight ${
            isLowCredits ? "text-yellow-500" : "text-[#74FF52]"
          }`}
        >
          {formatCredits(credits)}
        </span>
        <span className="text-[8px] text-white/50 leading-tight">{planName}</span>
      </Link>

      {/* Add Credits Button - Show when credits are low */}
      {isLowCredits && (
        <button
          onClick={openUpgradeModal}
          className="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/30 transition-all font-semibold w-full group"
          title="Add more credits"
        >
          <Plus className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
          <span className="text-[8px] text-center leading-tight">Add Credits</span>
        </button>
      )}
    </>
  );
}
