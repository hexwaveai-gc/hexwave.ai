"use client";

import { cn } from "@/lib/utils";
import { assetsTabs, type AssetsTabId } from "@/constants/assets";

interface AssetsTabsProps {
  activeTab: AssetsTabId;
  onTabChange: (tab: AssetsTabId) => void;
  counts?: {
    all?: number;
    images?: number;
    videos?: number;
    audio?: number;
    library?: number;
  };
}

export function AssetsTabs({
  activeTab,
  onTabChange,
  counts,
}: AssetsTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
      {assetsTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const count = counts?.[tab.id as keyof typeof counts];
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon className={cn(
              "w-4 h-4 transition-colors",
              isActive ? "text-[#74FF52]" : ""
            )} />
            <span>{tab.label}</span>
            
            {/* Count badge */}
            {count !== undefined && count > 0 && (
              <span className={cn(
                "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                isActive
                  ? "bg-[#74FF52]/20 text-[#74FF52]"
                  : "bg-white/10 text-white/50"
              )}>
                {count > 999 ? "999+" : count}
              </span>
            )}
            
            {/* Special badge */}
            {"badge" in tab && tab.badge && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/20">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

