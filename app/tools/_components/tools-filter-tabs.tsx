"use client";

import { cn } from "@/lib/utils";
import { type ToolCategory, TOOL_FILTER_TABS } from "@/constants/tools";

interface ToolsFilterTabsProps {
  activeTab: ToolCategory;
  onTabChange: (tab: ToolCategory) => void;
}

export function ToolsFilterTabs({
  activeTab,
  onTabChange,
}: ToolsFilterTabsProps) {
  return (
    <div className="mb-6">
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
        {TOOL_FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === tab.id
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
