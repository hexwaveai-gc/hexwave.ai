"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
}

interface ExploreTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function ExploreTabs({
  tabs,
  activeTab,
  onTabChange,
}: ExploreTabsProps) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "text-white bg-white/10"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

