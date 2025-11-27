"use client";

import { Search, ChevronDown } from "lucide-react";
import {
  AVATAR_TYPE_OPTIONS,
  GENDER_OPTIONS,
  ORIENTATION_OPTIONS,
  type AvatarTypeFilter,
  type GenderFilter,
  type OrientationFilter,
} from "@/constants/templates";
import { cn } from "@/lib/utils";

type TabType = "avatars" | "canvas" | "generations";

interface TemplatesHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  typeFilter: AvatarTypeFilter;
  onTypeFilterChange: (type: AvatarTypeFilter) => void;
  genderFilter: GenderFilter;
  onGenderFilterChange: (gender: GenderFilter) => void;
  orientationFilter: OrientationFilter;
  onOrientationFilterChange: (orientation: OrientationFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
}

const tabs: { id: TabType; label: string }[] = [
  { id: "avatars", label: "Avatars" },
  { id: "canvas", label: "Canvas" },
  { id: "generations", label: "Generations" },
];

export function TemplatesHeader({
  activeTab,
  onTabChange,
  typeFilter,
  onTypeFilterChange,
  genderFilter,
  onGenderFilterChange,
  orientationFilter,
  onOrientationFilterChange,
  searchQuery,
  onSearchChange,
  totalCount,
}: TemplatesHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Row: Tabs and Search */}
      <div className="flex items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search avatars..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 hover:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Avatar Type Filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as AvatarTypeFilter)}
            className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2 pr-10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/10 hover:bg-white/10 transition-all cursor-pointer"
          >
            {AVATAR_TYPE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id} className="bg-[#1a1a1a]">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
        </div>

        {/* Gender Filter Tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {GENDER_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onGenderFilterChange(option.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                genderFilter === option.id
                  ? "bg-[#74FF52]/20 text-[#74FF52]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Aspect Ratio Filter */}
        <div className="relative">
          <select
            value={orientationFilter}
            onChange={(e) => onOrientationFilterChange(e.target.value as OrientationFilter)}
            className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2 pr-10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/10 hover:bg-white/10 transition-all cursor-pointer"
          >
            {ORIENTATION_OPTIONS.map((option) => (
              <option key={option.id} value={option.id} className="bg-[#1a1a1a]">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
        </div>

        {/* Results Count */}
        <div className="ml-auto text-white/40 text-sm">
          {totalCount} avatar{totalCount !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
