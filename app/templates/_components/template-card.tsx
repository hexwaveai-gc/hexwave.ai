"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Play, Crown } from "lucide-react";
import { type PublicAvatar, getAvatarTypeLabel } from "@/constants/templates";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  avatar: PublicAvatar;
  isSelected: boolean;
  onClick: () => void;
}

export function TemplateCard({
  avatar,
  isSelected,
  onClick,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && avatar.videoUrl) {
      videoRef.current.play().catch(() => {
        // Video play failed, likely due to autoplay restrictions
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl transition-all duration-300",
        "bg-white/5 border hover:bg-white/10",
        isSelected
          ? "border-[#74FF52] ring-2 ring-[#74FF52]/30"
          : "border-white/10 hover:border-white/20"
      )}
    >
      {/* Preview Container - 16:9 aspect ratio */}
      <div className="relative aspect-video w-full overflow-hidden">
        {/* Static Image */}
        <Image
          src={avatar.imageUrl}
          alt={avatar.name}
          fill
          className={cn(
            "object-cover transition-all duration-500",
            isHovered && avatar.videoUrl ? "opacity-0" : "opacity-100 group-hover:scale-105"
          )}
          sizes="(max-width: 640px) 100vw, 50vw"
        />

        {/* Video Preview */}
        {avatar.videoUrl && (
          <video
            ref={videoRef}
            src={avatar.videoUrl}
            muted
            loop
            playsInline
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* Type Badge */}
          <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white/80">
            {getAvatarTypeLabel(avatar.avatarType)}
          </span>

          {/* Premium Badge */}
          {avatar.isPremium && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 text-[10px] font-bold text-white">
              <Crown className="w-3 h-3" />
              PRO
            </span>
          )}
        </div>

        {/* Video Play Indicator */}
        {avatar.videoUrl && !isHovered && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm mb-0.5 text-left truncate">
                {avatar.name}
              </h3>
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <span className="capitalize">{avatar.gender}</span>
                <span>•</span>
                <span className="capitalize">{avatar.orientation}</span>
                {avatar.numLooks > 1 && (
                  <>
                    <span>•</span>
                    <span>{avatar.numLooks} looks</span>
                  </>
                )}
              </div>
            </div>

            {/* Quality Badge */}
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase",
              avatar.quality === "high" && "bg-emerald-500/20 text-emerald-400",
              avatar.quality === "medium" && "bg-yellow-500/20 text-yellow-400",
              avatar.quality === "low" && "bg-red-500/20 text-red-400"
            )}>
              {avatar.quality}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
