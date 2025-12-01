"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  X, 
  Download, 
  Share2, 
  Heart, 
  Eye, 
  Clock, 
  Wand2,
  Copy,
  Check,
  ExternalLink,
  Globe,
  GlobeLock,
  Play,
  Pause,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import type { Asset } from "@/types/assets";
import { cn } from "@/lib/utils";

interface AssetDetailModalProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare?: (asset: Asset) => void;
  onUnshare?: (asset: Asset) => void;
  onDownload?: (asset: Asset) => void;
  isOwner?: boolean;
}

export function AssetDetailModal({
  asset,
  open,
  onOpenChange,
  onShare,
  onUnshare,
  onDownload,
  isOwner = true,
}: AssetDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!asset) return null;

  const handleCopyPrompt = async () => {
    const prompt = asset.metadata?.prompt;
    if (prompt) {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const typeColors = {
    image: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    video: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    audio: "bg-green-500/20 text-green-300 border-green-500/30",
    all: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-[#0f0f0f] border-white/10">
        <div className="flex flex-col lg:flex-row max-h-[90vh]">
          {/* Media preview */}
          <div className="relative flex-1 min-h-[300px] lg:min-h-[500px] bg-black flex items-center justify-center">
            {asset.type === "video" ? (
              <video
                src={asset.url}
                poster={asset.thumbnailUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay={isPlaying}
              />
            ) : asset.type === "audio" ? (
              <div className="flex flex-col items-center justify-center gap-6 p-8">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#74FF52]/20 to-emerald-500/20 flex items-center justify-center border border-[#74FF52]/30">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20 h-20 rounded-full bg-[#74FF52] flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-[#74FF52]/30"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-black" />
                    ) : (
                      <Play className="w-8 h-8 text-black fill-black ml-1" />
                    )}
                  </button>
                </div>
                <audio
                  src={asset.url}
                  autoPlay={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  controls
                  className="w-full max-w-md"
                />
              </div>
            ) : (
              <Image
                src={asset.url || asset.thumbnailUrl || "/default.svg"}
                alt={asset.title || "Asset"}
                fill
                className="object-contain"
              />
            )}

            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Type badge */}
            <Badge 
              className={cn(
                "absolute top-4 left-4 uppercase text-xs font-semibold",
                typeColors[asset.type]
              )}
            >
              {asset.type}
            </Badge>
          </div>

          {/* Details panel */}
          <div className="w-full lg:w-96 flex flex-col border-l border-white/5">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
              {asset.title && (
                <h2 className="text-xl font-semibold text-white mb-2">
                  {asset.title}
                </h2>
              )}
              
              <div className="flex items-center gap-3 text-sm text-white/50">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(asset.createdAt)}</span>
                </div>
                {asset.isShared && (
                  <div className="flex items-center gap-1 text-[#74FF52]">
                    <Globe className="w-4 h-4" />
                    <span>Shared</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              {(asset.likes > 0 || asset.views > 0) && (
                <div className="flex items-center gap-4 mt-3">
                  {asset.likes > 0 && (
                    <div className="flex items-center gap-1 text-white/60">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{asset.likes}</span>
                    </div>
                  )}
                  {asset.views > 0 && (
                    <div className="flex items-center gap-1 text-white/60">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{asset.views}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Prompt */}
            {asset.metadata?.prompt && (
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Prompt
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyPrompt}
                    className="h-7 px-2 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-[#74FF52]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-white/80 leading-relaxed bg-white/5 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {asset.metadata.prompt}
                </p>
              </div>
            )}

            {/* Details */}
            <div className="p-6 border-b border-white/5 flex-1 overflow-y-auto">
              <h3 className="text-sm font-medium text-white/70 mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Tool</span>
                  <span className="text-white">{asset.toolName || asset.toolId}</span>
                </div>
                {asset.metadata?.model && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Model</span>
                    <span className="text-white">{asset.metadata.model}</span>
                  </div>
                )}
                {asset.metadata?.width && asset.metadata?.height && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Dimensions</span>
                    <span className="text-white">
                      {asset.metadata.width} × {asset.metadata.height}
                    </span>
                  </div>
                )}
                {asset.metadata?.duration && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Duration</span>
                    <span className="text-white">
                      {Math.floor(asset.metadata.duration / 60)}:{String(Math.floor(asset.metadata.duration % 60)).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 space-y-3">
              {isOwner && (
                <>
                  {asset.isShared ? (
                    <Button
                      onClick={() => onUnshare?.(asset)}
                      variant="outline"
                      className="w-full bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      <GlobeLock className="w-4 h-4 mr-2" />
                      Unshare from Library
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onShare?.(asset)}
                      className="w-full bg-[#74FF52] text-black hover:bg-[#66e648]"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share to Library
                    </Button>
                  )}
                </>
              )}
              
              <Button
                onClick={() => onDownload?.(asset)}
                variant="outline"
                className="w-full bg-white/5 border-white/10 hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              {asset.url && (
                <Button
                  variant="ghost"
                  className="w-full text-white/60 hover:text-white"
                  asChild
                >
                  <a href={asset.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



