"use client";

import { Zap } from "lucide-react";
import { useUpgradePlan } from "@/app/providers/UpgradePlanProvider";

interface SidebarUpgradeButtonProps {
  variant?: "compact" | "expanded";
  onClose?: () => void;
}

/**
 * SidebarUpgradeButton component - Client component
 * Renders the upgrade to pro button
 * 
 * @reasoning Client component needed for onClick handler and upgrade modal context
 * Supports compact (sidebar) and expanded (mobile menu) variants
 */
export function SidebarUpgradeButton({ variant = "compact", onClose }: SidebarUpgradeButtonProps) {
  const { openModal } = useUpgradePlan();

  const handleClick = () => {
    if (onClose) {
      onClose();
    }
    openModal();
  };

  if (variant === "expanded") {
    return (
      <button
        onClick={handleClick}
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
      onClick={handleClick}
      className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-[#74FF52] text-[#0a0a0a] hover:bg-[#66e648] hover:shadow-[0_0_15px_rgba(116,255,82,0.4)] transition-all font-semibold w-full group"
      title="SALE 50% off"
    >
      <Zap className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
    </button>
  );
}

