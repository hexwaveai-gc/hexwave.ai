"use client";

import { useState } from "react";
import Sidebar from "@/app/components/common/Sidebar";
import PromoBanners from "@/app/components/explore/PromoBanners"; 
import ExploreTabs from "@/app/components/explore/ExploreTabs";
import FilterTabs from "@/app/components/explore/FilterTabs";
import MediaCard from "@/app/components/explore/MediaCard";
import MediaGrid from "@/app/components/explore/MediaGrid";
import FloatingActions from "@/app/components/explore/FloatingActions";
import { exploreTabs, filterTabs } from "@/constants/explore/tabs";
import { effectsData } from "@/constants/explore/effectsData";

const mockMedia: any[] = []; // Placeholder for other media data

// Transform effects data to media card format
const effectsMedia = effectsData.map((effect, index) => ({
  id: `effect-${index + 1}`,
  thumbnail: effect.poster,
  title: effect.effectName,
  author: {
    name: "Effects",
    verified: false,
  },
  likes: Math.floor(Math.random() * 1000) + 10, // Random likes between 10-1009
  href: `/effects/${effect.effectName.toLowerCase().replace(/\s+/g, "-")}`,
  type: "video" as const,
  videoUrl: effect.videoUrl,
}));

export default function ExplorePage() {
  const [activeExploreTab, setActiveExploreTab] = useState("recommended");
  const [activeFilterTab, setActiveFilterTab] = useState("foryou");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-20 pb-24">
        <div className="container mx-auto pt-6">
          {/* Promo Banners */}
          <PromoBanners />
 

          {/* Top Section with Tabs and Search */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              {/* Explore Tabs */}
              <ExploreTabs
                tabs={exploreTabs}
                activeTab={activeExploreTab}
                onTabChange={setActiveExploreTab}
              />

              {/* Search and Publish */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <button className="px-6 py-2 rounded-lg bg-[#74FF52] text-[#0a0a0a] font-semibold hover:bg-[#66e648] transition-colors whitespace-nowrap">
                  Publish
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <FilterTabs
              tabs={filterTabs}
              activeTab={activeFilterTab}
              onTabChange={setActiveFilterTab}
            />
          </div>

          {/* Media Grid */}
          <MediaGrid columns={5}>
            {activeExploreTab === "recommended"
              ? effectsMedia.map((media) => (
                  <MediaCard key={media.id} {...media} />
                ))
              : mockMedia.map((media) => (
                  <MediaCard key={media.id} {...media} />
                ))}
          </MediaGrid>
 
        </div>
      </main>

      {/* Floating Actions */}
      <FloatingActions />
    </div>
  );
}

