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

export function TemplatesContent() {
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
          <TemplatesGrid
            avatars={filteredAvatars}
            selectedAvatar={selectedAvatar}
            onSelectAvatar={setSelectedAvatar}
          />
        </div>
      </div>
    </div>
  );
}
