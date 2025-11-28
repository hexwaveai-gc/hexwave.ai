"use client";

import { useState } from "react";
import Image from "next/image";
import { Globe, Share2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import type { Asset } from "@/types/assets";

interface ShareDialogProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (data: { title?: string; description?: string }) => void;
  isLoading?: boolean;
}

export function ShareDialog({
  asset,
  open,
  onOpenChange,
  onShare,
  isLoading = false,
}: ShareDialogProps) {
  const [title, setTitle] = useState(asset?.title || "");
  const [description, setDescription] = useState(asset?.description || "");

  const handleShare = () => {
    onShare({ title: title || undefined, description: description || undefined });
  };

  // Reset form when dialog opens with new asset
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && asset) {
      setTitle(asset.title || "");
      setDescription(asset.description || "");
    }
    onOpenChange(newOpen);
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#74FF52]" />
            Share to Library
          </DialogTitle>
          <DialogDescription>
            Share your creation with the community. Others will be able to view and get inspired by your work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview */}
          <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
            <div className="aspect-video relative">
              <Image
                src={asset.thumbnailUrl || asset.url || "/default.svg"}
                alt={asset.title || "Asset preview"}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Title input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Give your creation a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10"
              maxLength={100}
            />
          </div>

          {/* Description input */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description or the prompt you used..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10 min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-white/40 text-right">
              {description.length}/500
            </p>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[#74FF52]/10 border border-[#74FF52]/20 text-sm">
            <Share2 className="w-4 h-4 text-[#74FF52] mt-0.5 shrink-0" />
            <p className="text-white/70">
              By sharing, you agree to our community guidelines. You can unshare at any time.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white/5 border-white/10 hover:bg-white/10"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            className="bg-[#74FF52] text-black hover:bg-[#66e648] font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Share
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


