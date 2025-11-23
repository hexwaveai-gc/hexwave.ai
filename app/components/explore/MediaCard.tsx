"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Video, Sparkles } from "lucide-react";
import { useState } from "react";

const DEFAULT_THUMBNAIL = "/default.svg";

interface MediaCardProps {
  id: string;
  thumbnail: string;
  title?: string;
  description?: string;
  duration?: string;
  author: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  likes: number;
  href: string;
  type?: "video" | "image";
  onRecreate?: () => void;
  videoUrl?: string;
}

export default function MediaCard({
  id,
  thumbnail,
  title,
  description,
  duration,
  author,
  likes,
  href,
  type = "video",
  onRecreate,
}: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5 break-inside-avoid mb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={href} className="block">
        {/* Thumbnail Container */}
        <div className="relative w-full bg-white/5 overflow-hidden">
          <Image
            src={imageError ? DEFAULT_THUMBNAIL : thumbnail}
            alt={title || "Media content"}
            width={500}
            height={500}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
            onError={() => setImageError(true)}
          />

          {/* Top Left Badge (if applicable) */}
          {/* {isNew && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/10 z-20">
              <span className="flex items-center gap-1 text-[10px] font-medium text-white uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                New
              </span>
            </div>
          )} */}

          {/* Overlay Gradient on Hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Centered Title */}
            {title && (
              <h3 className="text-white text-2xl font-black uppercase tracking-wide mb-6 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                {title}
              </h3>
            )}

            {/* Generate Button */}
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#74FF52]/20 hover:bg-[#74FF52]/30 text-[#74FF52] font-medium text-sm backdrop-blur-md border border-[#74FF52]/30 transition-all transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
              <Video className="w-4 h-4" />
              <span>Generate</span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

