"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: "100px", // Start loading 100px before visible
        threshold: 0.1,
      }
    );

    const currentRef = cardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (videoRef.current && avatar.videoUrl && videoLoaded) {
      videoRef.current.play().catch(() => {
        // Video play failed, likely due to autoplay restrictions
      });
    }
  }, [avatar.videoUrl, videoLoaded]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleVideoLoad = useCallback(() => {
    setVideoLoaded(true);
    // If already hovered when video loads, start playing
    if (isHovered && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isHovered]);

  return (
    <button
      ref={cardRef}
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
      {/* Preview Container - 9:16 portrait aspect ratio */}
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-white/5">
        {/* Skeleton loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
        )}

        {/* Static Image - Only load when visible */}
        {isVisible && (
          <Image
            src={avatar.imageUrl}
            alt={avatar.name}
            fill
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "object-cover transition-all duration-500",
              !imageLoaded && "opacity-0",
              imageLoaded && (isHovered && avatar.videoUrl && videoLoaded 
                ? "opacity-0" 
                : "opacity-100 group-hover:scale-105")
            )}
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        )}

        {/* Video Preview - Only load when visible and has video URL */}
        {isVisible && avatar.videoUrl && (
          <video
            ref={videoRef}
            src={avatar.videoUrl}
            muted
            loop
            playsInline
            preload="none"
            onCanPlayThrough={handleVideoLoad}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
              isHovered && videoLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          {/* Type Badge */}
          <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-medium text-white/80">
            {getAvatarTypeLabel(avatar.avatarType)}
          </span>

          {/* Premium Badge */}
          {avatar.isPremium && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/90 text-[9px] font-bold text-white">
              <Crown className="w-2.5 h-2.5" />
              PRO
            </span>
          )}
        </div>

        {/* Video Play Indicator */}
        {avatar.videoUrl && !isHovered && imageLoaded && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-white font-semibold text-xs leading-tight text-left line-clamp-2">
                {avatar.name}
              </h3>
              {/* Quality Badge */}
              <span className={cn(
                "px-1 py-0.5 rounded text-[8px] font-semibold uppercase flex-shrink-0",
                avatar.quality === "high" && "bg-emerald-500/20 text-emerald-400",
                avatar.quality === "medium" && "bg-yellow-500/20 text-yellow-400",
                avatar.quality === "low" && "bg-red-500/20 text-red-400"
              )}>
                {avatar.quality}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-white/50 text-[10px]">
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
        </div>
      </div>
    </button>
  );
}
