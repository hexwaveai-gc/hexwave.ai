"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import type { Avatar } from "@/constants/video-agent";
import { cn } from "@/lib/utils";

interface AvatarCardProps {
  avatar: Avatar;
  isSelected: boolean;
  onClick: () => void;
}

export function AvatarCard({ avatar, isSelected, onClick }: AvatarCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-xl transition-all duration-300",
        "bg-white/5 border hover:bg-white/10",
        isSelected
          ? "border-cyan-400 ring-2 ring-cyan-400/30"
          : "border-white/10 hover:border-white/20"
      )}
    >
      {/* Preview Container - Portrait aspect ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {/* Avatar Image */}
        {!imageError ? (
          <Image
            src={avatar.previewUrl}
            alt={avatar.name}
            fill
            className={cn(
              "object-cover transition-all duration-500",
              isHovered ? "scale-105" : "scale-100"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Favorite Button */}
        {avatar.isFavorite && (
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
          </div>
        )}

        {/* Name */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-medium text-sm text-left truncate">
            {avatar.name}
          </h3>
        </div>
      </div>
    </button>
  );
}


