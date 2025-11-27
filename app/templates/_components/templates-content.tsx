"use client";

import { useState, useMemo, useCallback } from "react";
import {
  type PublicAvatar,
  type AvatarTypeFilter,
  type GenderFilter,
  type OrientationFilter,
  filterAvatars,
  PUBLIC_AVATARS,
} from "@/constants/templates";
import { TemplatesHeader } from "./templates-header";
import { TemplatesSidebar } from "./templates-sidebar";
import { TemplatesGrid } from "./templates-grid";

type TabType = "avatars" | "canvas" | "generations";

export function TemplatesContent() {
  const [activeTab, setActiveTab] = useState<TabType>("avatars");
  const [typeFilter, setTypeFilter] = useState<AvatarTypeFilter>("all");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [orientationFilter, setOrientationFilter] = useState<OrientationFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<PublicAvatar | null>(
    PUBLIC_AVATARS[0] || null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter avatars based on all criteria
  const filteredAvatars = useMemo(() => {
    return filterAvatars({
      type: typeFilter,
      gender: genderFilter,
      orientation: orientationFilter,
      search: searchQuery,
    });
  }, [typeFilter, genderFilter, orientationFilter, searchQuery]);

  const handleGenerate = useCallback(
    async (formData: Record<string, string | File>, avatar: PublicAvatar | null) => {
      if (!avatar) return;

      setIsGenerating(true);
      try {
        // TODO: Implement actual generation logic
        console.log("Generating with:", { avatar, formData });
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      } catch (error) {
        console.error("Generation failed:", error);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Avatar Details & Form */}
      <aside className="w-80 xl:w-96 border-r border-white/10 bg-[#0f0f0f] flex-shrink-0">
        <TemplatesSidebar
          selectedAvatar={selectedAvatar}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      </aside>

      {/* Main Content - Avatar Gallery */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header with tabs, filters, search */}
        <div className="p-6 pb-0">
          <TemplatesHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            genderFilter={genderFilter}
            onGenderFilterChange={setGenderFilter}
            orientationFilter={orientationFilter}
            onOrientationFilterChange={setOrientationFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalCount={filteredAvatars.length}
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {activeTab === "avatars" && (
            <TemplatesGrid
              avatars={filteredAvatars}
              selectedAvatar={selectedAvatar}
              onSelectAvatar={setSelectedAvatar}
            />
          )}

          {activeTab === "canvas" && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <span className="text-4xl">🎨</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">
                Canvas Coming Soon
              </h3>
              <p className="text-white/50 text-sm text-center max-w-md">
                Create custom templates with our powerful canvas editor.
                Available in the next update.
              </p>
            </div>
          )}

          {activeTab === "generations" && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <span className="text-4xl">📁</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">
                No Generations Yet
              </h3>
              <p className="text-white/50 text-sm text-center max-w-md">
                Your generated content will appear here. Select an avatar and
                start creating!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
