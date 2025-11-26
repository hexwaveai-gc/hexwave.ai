"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import Image from "next/image";
import { Camera, X, Loader2 } from "lucide-react";
import { useUpdateProfile } from "@/hooks";
import type { UserProfile, UpdateProfileData } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

interface EditProfileModalProps {
  profile: UserProfile;
  userImageUrl: string;
  onClose: () => void;
  onUpdate: (profile: UserProfile) => void;
}

interface FormData {
  username: string;
  bio: string;
  twitter: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  website: string;
}

// ============================================================================
// Component
// ============================================================================

export function EditProfileModal({ 
  profile, 
  userImageUrl, 
  onClose, 
  onUpdate 
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<FormData>({
    username: profile.username,
    bio: profile.bio || "",
    twitter: profile.social_links?.twitter || "",
    instagram: profile.social_links?.instagram || "",
    youtube: profile.social_links?.youtube || "",
    tiktok: profile.social_links?.tiktok || "",
    website: profile.social_links?.website || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || userImageUrl);
  const [coverUrl, setCoverUrl] = useState(profile.cover_url || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Mutation
  const updateProfile = useUpdateProfile();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const uploadImage = async (file: File, type: "avatar" | "cover") => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formDataUpload,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Cloudinary upload failed");
      }
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      throw uploadError;
    }
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed for avatar.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar image must be less than 5MB.");
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);
    try {
      const url = await uploadImage(file, "avatar");
      setAvatarUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed for cover.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Cover image must be less than 10MB.");
      return;
    }

    setIsUploadingCover(true);
    setError(null);
    try {
      const url = await uploadImage(file, "cover");
      setCoverUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload cover.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    const updateData: UpdateProfileData = {
      username: formData.username,
      bio: formData.bio,
      avatar_url: avatarUrl,
      cover_url: coverUrl,
      social_links: {
        twitter: formData.twitter,
        instagram: formData.instagram,
        youtube: formData.youtube,
        tiktok: formData.tiktok,
        website: formData.website,
      },
    };

    try {
      const updatedProfile = await updateProfile.mutateAsync(updateData);
      onUpdate(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const isLoading = updateProfile.isPending;
  const isUploading = isUploadingAvatar || isUploadingCover;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-[#151515] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Edit profile</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Cover Image */}
          <div className="relative h-32 rounded-xl overflow-hidden bg-[#1a1a1a]">
            {coverUrl ? (
              <Image src={coverUrl} alt="Cover" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                <div
                  className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-80"
                  style={{
                    background: "radial-gradient(circle, #74FF52 0%, transparent 70%)",
                    filter: "blur(40px)",
                  }}
                />
              </div>
            )}
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverChange}
              className="hidden"
              accept="image/*"
            />
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-white/90 text-black text-sm font-medium rounded-lg hover:bg-white transition-colors flex items-center gap-2"
            >
              {isUploadingCover ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                "Change Cover"
              )}
            </button>

            {/* Avatar in modal */}
            <div className="absolute -bottom-8 left-4">
              <div className="relative w-20 h-20 rounded-full border-4 border-[#151515] overflow-hidden bg-[#1a1a1a] group">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
                    <span className="text-2xl font-bold text-white">
                      {formData.username[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 pt-8">
            {/* Username */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">Username*</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#74FF52]/50 transition-colors"
                placeholder="username"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#74FF52]/50 transition-colors resize-none"
                placeholder="Type bio here..."
              />
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#74FF52]/50 transition-colors"
                placeholder="x.com/"
              />
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#74FF52]/50 transition-colors"
                placeholder="instagram.com/"
              />
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#74FF52]/50 transition-colors"
                placeholder="youtube.com/@"
              />
              <input
                type="text"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#74FF52]/50 transition-colors"
                placeholder="tiktok.com/@"
              />
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#74FF52]/50 transition-colors"
                placeholder="yourwebsite.com"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading || isUploading}
            className="px-6 py-2.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

