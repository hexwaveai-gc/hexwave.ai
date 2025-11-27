"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Loader2, ImageIcon, Video, LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks";
import { EditProfileModal } from "./edit-profile-modal";
import type { UserProfile } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

type TabType = "all" | "image" | "video" | "boards";

interface ProfileContentProps {
  clerkImageUrl?: string;
  clerkFullName?: string;
}

const tabs: { id: TabType; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "All" },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "video", label: "Video", icon: Video },
  { id: "boards", label: "Boards", icon: LayoutGrid },
];

// ============================================================================
// Sub-components
// ============================================================================

function ProfileAvatar({ avatarUrl, fallbackUrl, displayName }: { avatarUrl: string | null; fallbackUrl?: string; displayName: string }) {
  const imageUrl = avatarUrl || fallbackUrl;
  return (
    <div className="relative w-28 h-28 rounded-full border-4 border-[#0a0a0a] overflow-hidden bg-[#1a1a1a]">
      {imageUrl ? (
        <Image src={imageUrl} alt={displayName} fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
          <span className="text-3xl font-bold text-white">{displayName[0]?.toUpperCase() || "U"}</span>
        </div>
      )}
    </div>
  );
}

function ProfileCover({ coverUrl }: { coverUrl: string | null }) {
  return (
    <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
      {coverUrl ? (
        <Image src={coverUrl} alt="Cover" fill className="object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-80" style={{ background: "radial-gradient(circle, #74FF52 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>
      )}
    </div>
  );
}

function ProfileStats({ stats }: { stats: UserProfile["stats"] }) {
  return (
    <div className="flex items-center gap-6 mt-3 text-sm">
      <div><span className="font-bold">{stats.likes || 0}</span><span className="text-white/50 ml-1">likes</span></div>
      <div><span className="font-bold">{stats.posts || 0}</span><span className="text-white/50 ml-1">posts</span></div>
      <div><span className="font-bold">{stats.views || 0}</span><span className="text-white/50 ml-1">views</span></div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex -space-x-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden transform rotate-6 hover:rotate-0 transition-transform" style={{ transform: `rotate(${(i - 2.5) * 8}deg)` }}>
            <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
          </div>
        ))}
      </div>
      <h3 className="text-xl font-semibold mb-2">Create. Share. Inspire.</h3>
      <p className="text-white/50 max-w-sm mb-6">Publish your generations and see how others bring their ideas to life.</p>
      <Link href="/image-generator" className="flex items-center gap-2 px-6 py-3 bg-[#74FF52] text-black font-semibold rounded-xl hover:bg-[#66e648] transition-colors">
        <Sparkles className="w-4 h-4" />Publish
      </Link>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProfileContent({ clerkImageUrl, clerkFullName }: ProfileContentProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const { data: profile, isLoading, refetch } = useProfile();

  const handleProfileUpdate = () => {
    refetch();
    setIsEditModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#74FF52]" />
      </div>
    );
  }

  const displayName = profile?.display_name || profile?.username || clerkFullName || "User";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Cover Image & Avatar Container */}
      <div className="relative">
        <ProfileCover coverUrl={profile?.cover_url || null} />
        <div className="absolute -bottom-14 left-8 z-10">
          <ProfileAvatar avatarUrl={profile?.avatar_url || null} fallbackUrl={clerkImageUrl} displayName={displayName} />
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-16 px-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{profile?.username || "user"}</h1>
              <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <Pencil className="w-3.5 h-3.5" />Edit
              </button>
            </div>
            {profile?.stats && <ProfileStats stats={profile.stats} />}
            {profile?.bio && <p className="mt-4 text-white/70 max-w-xl">{profile.bio}</p>}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-white/10">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("px-5 py-3 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2", activeTab === tab.id ? "bg-white text-black" : "text-white/60 hover:text-white hover:bg-white/5")}>
                  {Icon && <Icon className="w-4 h-4" />}{tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="py-16"><EmptyState /></div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && profile && (
        <EditProfileModal profile={profile} userImageUrl={clerkImageUrl || ""} onClose={() => setIsEditModalOpen(false)} onUpdate={handleProfileUpdate} />
      )}
    </div>
  );
}
