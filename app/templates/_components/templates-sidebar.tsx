"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, X, Upload, Loader2, Crown, Play } from "lucide-react";
import { type PublicAvatar, getAvatarTypeLabel } from "@/constants/templates";
import { cn } from "@/lib/utils";

interface TemplatesSidebarProps {
  selectedAvatar: PublicAvatar | null;
  onGenerate: (formData: Record<string, string | File>, avatar: PublicAvatar | null) => void;
  isGenerating: boolean;
}

export function TemplatesSidebar({
  selectedAvatar,
  onGenerate,
  isGenerating,
}: TemplatesSidebarProps) {
  const [formData, setFormData] = useState<Record<string, string | File>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((file: File | null) => {
    if (file) {
      setFormData((prev) => ({ ...prev, referenceImage: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => ({
          ...prev,
          referenceImage: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => {
        const newData = { ...prev };
        delete newData.referenceImage;
        return newData;
      });
      setImagePreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews.referenceImage;
        return newPreviews;
      });
    }
  }, []);

  const handleTextChange = useCallback((fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleSubmit = () => {
    if (!selectedAvatar) return;
    onGenerate(formData, selectedAvatar);
  };

  const hasRequiredFields = useCallback(() => {
    return selectedAvatar !== null && formData.script?.toString().trim();
  }, [selectedAvatar, formData.script]);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  if (!selectedAvatar) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <span className="text-3xl">👈</span>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">
          Select an Avatar
        </h3>
        <p className="text-white/50 text-sm">
          Choose an avatar from the gallery to get started
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <h2 className="text-white font-semibold text-lg">Create Video</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Selected Avatar Preview */}
        <div className="p-5 border-b border-white/10">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/20 mb-4">
            {selectedAvatar.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={selectedAvatar.videoUrl}
                  poster={selectedAvatar.imageUrl}
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
                <button
                  onClick={toggleVideoPlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                >
                  {!isVideoPlaying && (
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                  )}
                </button>
              </>
            ) : (
              <Image
                src={selectedAvatar.imageUrl}
                alt={selectedAvatar.name}
                fill
                className="object-cover"
              />
            )}
            
            {/* Premium Badge */}
            {selectedAvatar.isPremium && (
              <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 text-[10px] font-bold text-white">
                <Crown className="w-3 h-3" />
                PRO
              </span>
            )}
          </div>

          {/* Avatar Info */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-lg">
              {selectedAvatar.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 rounded-md bg-white/10 text-xs text-white/70">
                {getAvatarTypeLabel(selectedAvatar.avatarType)}
              </span>
              <span className="px-2 py-1 rounded-md bg-white/10 text-xs text-white/70 capitalize">
                {selectedAvatar.gender}
              </span>
              <span className="px-2 py-1 rounded-md bg-white/10 text-xs text-white/70 capitalize">
                {selectedAvatar.orientation}
              </span>
              <span className={cn(
                "px-2 py-1 rounded-md text-xs",
                selectedAvatar.quality === "high" && "bg-emerald-500/20 text-emerald-400",
                selectedAvatar.quality === "medium" && "bg-yellow-500/20 text-yellow-400",
                selectedAvatar.quality === "low" && "bg-red-500/20 text-red-400"
              )}>
                {selectedAvatar.quality} quality
              </span>
            </div>
            {selectedAvatar.numLooks > 1 && (
              <p className="text-white/50 text-sm">
                {selectedAvatar.numLooks} different looks available
              </p>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-5 space-y-5">
          {/* Script Input */}
          <div className="space-y-2">
            <label className="block text-white/70 text-sm font-medium">
              Enter your script <span className="text-red-400">*</span>
            </label>
            <textarea
              placeholder="Type your video script here..."
              value={(formData.script as string) || ""}
              onChange={(e) => handleTextChange("script", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all resize-none"
            />
            <p className="text-white/40 text-xs">
              {(formData.script?.toString() || "").length} characters
            </p>
          </div>

          {/* Reference Image (Optional) */}
          <div className="space-y-2">
            <label className="block text-white/70 text-sm font-medium">
              Reference image <span className="text-white/40">(optional)</span>
            </label>
            {imagePreviews.referenceImage ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                <Image
                  src={imagePreviews.referenceImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => handleImageUpload(null)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white/60" />
                </div>
                <span className="text-white/60 text-sm">
                  Add reference image
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="p-5 border-t border-white/10">
        <button
          onClick={handleSubmit}
          disabled={!hasRequiredFields() || isGenerating}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200",
            hasRequiredFields() && !isGenerating
              ? "bg-[#74FF52] text-[#0a0a0a] hover:bg-[#66e648]"
              : "bg-[#74FF52]/20 text-[#74FF52]/50 cursor-not-allowed border border-[#74FF52]/30"
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Generate Video</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
