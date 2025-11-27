"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { 
  Heart, 
  Eye, 
  Share2, 
  Download, 
  Play, 
  Pause,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Globe,
  GlobeLock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Asset } from "@/types/assets";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";

interface AssetCardProps {
  asset: Asset;
  onView?: (asset: Asset) => void;
  onShare?: (asset: Asset) => void;
  onUnshare?: (asset: Asset) => void;
  onDownload?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
  showAuthor?: boolean;
  isOwner?: boolean;
}

const DEFAULT_THUMBNAIL = "/default.svg";

export function AssetCard({
  asset,
  onView,
  onShare,
  onUnshare,
  onDownload,
  onDelete,
  showAuthor = false,
  isOwner = true,
}: AssetCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const thumbnailUrl = imageError 
    ? DEFAULT_THUMBNAIL 
    : asset.thumbnailUrl || asset.url || DEFAULT_THUMBNAIL;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (asset.type === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (asset.type === "audio" && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleClick = () => {
    onView?.(asset);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const typeColors = {
    image: "from-blue-500/20 to-purple-500/20",
    video: "from-pink-500/20 to-orange-500/20",
    audio: "from-green-500/20 to-teal-500/20",
    all: "from-gray-500/20 to-gray-600/20",
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-[#141414] border border-white/5 transition-all duration-300 hover:border-white/10 hover:shadow-xl hover:shadow-black/20 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Thumbnail / Media */}
      <div className="relative aspect-square bg-white/5 overflow-hidden">
        {asset.type === "video" && asset.url ? (
          <>
            <video
              ref={videoRef}
              src={asset.url}
              poster={thumbnailUrl}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
            />
            {/* Play overlay */}
            <button
              onClick={handlePlayToggle}
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity",
                isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
              )}
            >
              {isPlaying ? (
                <Pause className="w-12 h-12 text-white drop-shadow-lg" />
              ) : (
                <Play className="w-12 h-12 text-white drop-shadow-lg fill-white" />
              )}
            </button>
          </>
        ) : asset.type === "audio" ? (
          <>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#74FF52]/10 to-emerald-500/10">
              <div className="relative">
                {/* Audio waveform visualization placeholder */}
                <div className="flex items-end gap-1 h-16">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 rounded-full bg-[#74FF52] transition-all duration-300",
                        isPlaying ? "animate-pulse" : ""
                      )}
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <audio ref={audioRef} src={asset.url} />
            <button
              onClick={handlePlayToggle}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#74FF52] flex items-center justify-center shadow-lg shadow-[#74FF52]/30 hover:scale-110 transition-transform">
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-black" />
                ) : (
                  <Play className="w-7 h-7 text-black fill-black ml-1" />
                )}
              </div>
            </button>
          </>
        ) : (
          <Image
            src={thumbnailUrl}
            alt={asset.title || "Asset"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        )}

        {/* Duration badge for video/audio */}
        {(asset.type === "video" || asset.type === "audio") && asset.metadata?.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-medium backdrop-blur-sm">
            {formatDuration(asset.metadata.duration)}
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <div className={cn(
            "px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md border border-white/10",
            "bg-gradient-to-r",
            typeColors[asset.type]
          )}>
            {asset.type}
          </div>
        </div>

        {/* Shared badge */}
        {asset.isShared && (
          <div className="absolute top-2 right-2">
            <div className="p-1.5 rounded-lg bg-[#74FF52]/20 border border-[#74FF52]/30 backdrop-blur-md">
              <Globe className="w-3.5 h-3.5 text-[#74FF52]" />
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          {/* Action buttons */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {asset.likes > 0 && (
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{asset.likes}</span>
                </div>
              )}
              {asset.views > 0 && (
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{asset.views}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {onDownload && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-lg hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(asset);
                  }}
                >
                  <Download className="w-4 h-4 text-white" />
                </Button>
              )}
              
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-lg hover:bg-white/20"
                    >
                      <MoreHorizontal className="w-4 h-4 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onView?.(asset)}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {asset.isShared ? (
                      <DropdownMenuItem onClick={() => onUnshare?.(asset)}>
                        <GlobeLock className="w-4 h-4 mr-2" />
                        Unshare
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onShare?.(asset)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share to Library
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDownload?.(asset)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(asset)}
                      className="text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Title */}
        {asset.title && (
          <h3 className="text-sm font-medium text-white/90 truncate mb-1">
            {asset.title}
          </h3>
        )}
        
        {/* Tool / Author */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50 truncate">
            {showAuthor && asset.author ? (
              <span className="flex items-center gap-1.5">
                {asset.author.avatar && (
                  <Image
                    src={asset.author.avatar}
                    alt={asset.author.name}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                )}
                {asset.author.name}
              </span>
            ) : (
              asset.toolName || asset.toolId
            )}
          </span>
          
          {/* Time */}
          <span className="text-[10px] text-white/40">
            {new Date(asset.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

