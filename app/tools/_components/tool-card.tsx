"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { type Tool, BADGE_STYLES } from "@/constants/tools";

// Icon components for fallback display
function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  );
}

function AudioIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
      />
    </svg>
  );
}

const categoryIcons = {
  image: ImageIcon,
  video: VideoIcon,
  audio: AudioIcon,
};

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const [imageError, setImageError] = useState(false);
  const CardWrapper = tool.isComingSoon ? "div" : Link;
  const cardProps = tool.isComingSoon
    ? { className: "cursor-not-allowed" }
    : { href: tool.href };

  const IconComponent =
    categoryIcons[tool.category as keyof typeof categoryIcons] || ImageIcon;

  return (
    <CardWrapper
      {...(cardProps as React.ComponentProps<typeof Link>)}
      className={cn(
        "group relative block rounded-2xl overflow-hidden",
        "bg-[#151515] border border-white/10",
        "transition-all duration-300",
        !tool.isComingSoon && [
          "hover:border-white/20",
          "hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
          "hover:scale-[1.02]",
        ],
        tool.isComingSoon && "opacity-60"
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {/* Tool Image or Fallback */}
        {!imageError ? (
          <Image
            src={tool.image}
            alt={tool.name}
            fill
            className={cn(
              "object-cover transition-transform duration-500",
              !tool.isComingSoon && "group-hover:scale-105"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
            unoptimized={tool.image.startsWith("http")}
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
              tool.gradient || "from-purple-500/20 to-pink-500/20"
            )}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <IconComponent className="w-8 h-8 text-white/60" />
              </div>
            </div>
          </div>
        )}

        {/* Badge */}
        {tool.badge && (
          <div className="absolute top-3 right-3 z-10">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
                BADGE_STYLES[tool.badge.variant]
              )}
            >
              {tool.badge.text}
            </span>
          </div>
        )}

        {/* Video Recording Indicator (for video tools) */}
        {tool.category === "video" && !tool.isComingSoon && (
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-[#74FF52] animate-pulse" />
              <span className="text-[10px] font-semibold text-white/90 tracking-wide">
                REC
              </span>
            </div>
          </div>
        )}

        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Corner Brackets (for video tools) */}
        {tool.category === "video" && !tool.isComingSoon && (
          <>
            <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-white/30 ml-14" />
            <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-white/30 mr-16" />
            <div className="absolute bottom-16 left-3 w-5 h-5 border-l-2 border-b-2 border-white/30" />
            <div className="absolute bottom-16 right-3 w-5 h-5 border-r-2 border-b-2 border-white/30" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-base font-semibold text-white mb-0.5 line-clamp-1">
          {tool.name}
        </h3>
        <p className="text-sm text-white/60 line-clamp-1">{tool.description}</p>
      </div>

      {/* Hover Glow Effect */}
      {!tool.isComingSoon && (
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
            "bg-gradient-to-br",
            tool.gradient || "from-purple-500/10 to-pink-500/10"
          )}
        />
      )}
    </CardWrapper>
  );
}
