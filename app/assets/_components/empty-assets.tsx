"use client";

import Link from "next/link";
import { FolderOpen, Image, Video, Music, Sparkles, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import type { AssetsTabId } from "@/constants/assets";
import { cn } from "@/lib/utils";

interface EmptyAssetsProps {
  activeTab: AssetsTabId;
}

const tabConfig = {
  all: {
    icon: FolderOpen,
    title: "No generations yet",
    description: "Start creating amazing content with our AI tools. Your images, videos, and audio will appear here.",
    action: {
      label: "Explore Tools",
      href: "/tools",
    },
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  images: {
    icon: Image,
    title: "No images yet",
    description: "Create stunning AI-generated images with Flux, Ideogram, and more.",
    action: {
      label: "Generate Images",
      href: "/image-generator",
    },
    gradient: "from-blue-500/20 to-purple-500/20",
  },
  videos: {
    icon: Video,
    title: "No videos yet",
    description: "Generate amazing videos with Kling, Luma, Runway, and other AI video tools.",
    action: {
      label: "Create Videos",
      href: "/ai-video-generator",
    },
    gradient: "from-pink-500/20 to-orange-500/20",
  },
  audio: {
    icon: Music,
    title: "No audio yet",
    description: "Create voice overs, music, and sound effects with our AI audio tools.",
    action: {
      label: "Generate Audio",
      href: "/audio",
    },
    gradient: "from-green-500/20 to-teal-500/20",
  },
  library: {
    icon: Sparkles,
    title: "Library is empty",
    description: "Be the first to share! The community library shows generations shared by other users.",
    action: {
      label: "Explore & Share",
      href: "/explore",
    },
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
};

export function EmptyAssets({ activeTab }: EmptyAssetsProps) {
  const config = tabConfig[activeTab];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* Icon container */}
      <div className={cn(
        "relative w-24 h-24 rounded-3xl flex items-center justify-center mb-6",
        "bg-gradient-to-br",
        config.gradient,
        "border border-white/10"
      )}>
        <Icon className="w-10 h-10 text-white/80" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#74FF52] flex items-center justify-center shadow-lg shadow-[#74FF52]/30">
          <Plus className="w-4 h-4 text-black" />
        </div>
      </div>

      {/* Text */}
      <h2 className="text-xl font-semibold text-white mb-2 text-center">
        {config.title}
      </h2>
      <p className="text-white/50 text-center max-w-md mb-8 text-sm leading-relaxed">
        {config.description}
      </p>

      {/* Action button */}
      <Link href={config.action.href}>
        <Button className="bg-[#74FF52] text-black hover:bg-[#66e648] font-semibold px-6">
          {config.action.label}
        </Button>
      </Link>

      {/* Decorative elements */}
      <div className="mt-12 flex items-center gap-3 text-white/30 text-xs">
        <div className="flex items-center gap-1.5">
          <Image className="w-4 h-4" />
          <span>Images</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Video className="w-4 h-4" />
          <span>Videos</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Music className="w-4 h-4" />
          <span>Audio</span>
        </div>
      </div>
    </div>
  );
}

