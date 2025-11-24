"use client";

import { cn } from "@/lib/utils";

interface SubscriptionToggleProps {
  isYearly: boolean;
  onToggle: (isYearly: boolean) => void;
}

export default function SubscriptionToggle({
  isYearly,
  onToggle,
}: SubscriptionToggleProps) {
  return (
    <div className="flex items-center justify-center my-6">
      <div className="relative flex items-center rounded-lg border border-slate-700/50 bg-slate-800/30 p-1">
        {/* Active Background Slider */}
        <div
          className={cn(
            "absolute h-[calc(100%-8px)] rounded-md bg-gradient-to-r from-[#1a4d2e] to-[#0f3d20] transition-all duration-200 ease-in-out",
            isYearly ? "left-1 w-[calc(50%-4px)]" : "left-[calc(50%+4px)] w-[calc(50%-4px)]"
          )}
        />
        
        <button
          onClick={() => onToggle(true)}
          className={cn(
            "relative z-10 flex items-center px-4 py-2.5 transition-all text-sm font-medium rounded-md",
            isYearly
              ? "text-[#74FF52]"
              : "text-white/70"
          )}
        >
          <span>Yearly</span>
          <div
            className={cn(
              "flex items-center justify-center px-2 rounded text-[10px] font-semibold whitespace-nowrap",
              isYearly
                ? "bg-gradient-to-r from-[#74FF52] to-[#66e648] text-[#0a0a0a] shadow-sm"
                : "bg-slate-700/60 text-[#74FF52]/60"
            )}
            style={{ height: '20px', marginLeft: '4px' }}
          >
            50% OFF
          </div>
        </button>
        
        <button
          onClick={() => onToggle(false)}
          className={cn(
            "relative z-10 flex items-center px-4 py-2.5 transition-all text-sm font-medium rounded-md",
            !isYearly
              ? "text-[#74FF52]"
              : "text-white/70"
          )}
        >
          <span>Monthly</span>
          <div
            className={cn(
              "flex items-center justify-center px-2 rounded text-[10px] font-semibold whitespace-nowrap",
              !isYearly
                ? "bg-gradient-to-r from-[#74FF52] to-[#66e648] text-[#0a0a0a] shadow-sm"
                : "bg-slate-700/60 text-[#74FF52]/60"
            )}
            style={{ height: '20px', marginLeft: '4px' }}
          >
            -12%
          </div>
        </button>
      </div>
    </div>
  );
}


