"use client";

import type { PublicAvatar } from "@/constants/templates";
import { TemplateCard } from "./template-card";

interface TemplatesGridProps {
  avatars: PublicAvatar[];
  selectedAvatar: PublicAvatar | null;
  onSelectAvatar: (avatar: PublicAvatar) => void;
}

export function TemplatesGrid({
  avatars,
  selectedAvatar,
  onSelectAvatar,
}: TemplatesGridProps) {
  if (avatars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-white/80 text-lg font-medium mb-2">
          No avatars found
        </h3>
        <p className="text-white/50 text-sm">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {avatars.map((avatar) => (
        <TemplateCard
          key={avatar.id}
          avatar={avatar}
          isSelected={selectedAvatar?.id === avatar.id}
          onClick={() => onSelectAvatar(avatar)}
        />
      ))}
    </div>
  );
}
