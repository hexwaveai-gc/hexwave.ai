"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { sortOptions, type SortOptionId } from "@/constants/assets";
import type { AssetStats } from "@/types/assets";
import { cn } from "@/lib/utils";

interface AssetsHeaderProps {
  stats?: AssetStats;
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortOption: SortOptionId;
  onSortChange: (option: SortOptionId) => void;
}

export function AssetsHeader({
  stats,
  searchValue,
  onSearchChange,
  sortOption,
  onSortChange,
}: AssetsHeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const currentSort = sortOptions.find((opt) => opt.id === sortOption) || sortOptions[0];

  return (
    <div className="space-y-6">
      {/* Title and Stats */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            My Assets
          </h1>
          {stats && (
            <div className="flex items-center gap-4 mt-2 text-sm text-white/50">
              <span>
                <strong className="text-white/80">{stats.totalImages}</strong> images
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>
                <strong className="text-white/80">{stats.totalVideos}</strong> videos
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>
                <strong className="text-white/80">{stats.totalAudio}</strong> audio
              </span>
              {stats.totalShared > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>
                    <strong className="text-[#74FF52]">{stats.totalShared}</strong> shared
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Search and Sort */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className={cn(
            "relative flex-1 md:w-72 transition-all duration-200",
            isSearchFocused ? "md:w-80" : ""
          )}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search generations..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#74FF52]/50 focus:ring-[#74FF52]/20"
            />
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">{currentSort.label}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => onSortChange(option.id)}
                    className={cn(
                      sortOption === option.id && "bg-white/10"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}




