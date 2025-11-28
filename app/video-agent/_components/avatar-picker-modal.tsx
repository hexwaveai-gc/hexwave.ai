"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
  type Avatar,
  type AvatarCategory,
  AVATAR_CATEGORIES,
  getAvatarsByCategory,
  searchAvatars,
  AVATARS,
} from "@/constants/video-agent";
import { AvatarCard } from "./avatar-card";
import { cn } from "@/lib/utils";

type TabType = "my-avatars" | "public-avatars";

interface AvatarPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAvatar: Avatar | null;
  onSelectAvatar: (avatar: Avatar) => void;
}

export function AvatarPickerModal({
  open,
  onOpenChange,
  selectedAvatar,
  onSelectAvatar,
}: AvatarPickerModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("public-avatars");
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter avatars based on category and search
  const filteredAvatars = useMemo(() => {
    let avatars = getAvatarsByCategory(activeCategory);
    if (searchQuery.trim()) {
      const searchResults = searchAvatars(searchQuery);
      avatars = avatars.filter((a) =>
        searchResults.some((sr) => sr.id === a.id)
      );
    }
    return avatars;
  }, [activeCategory, searchQuery]);

  const handleSelectAvatar = (avatar: Avatar) => {
    onSelectAvatar(avatar);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] bg-[#1a1a1a] border-white/10 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-lg font-semibold text-white">
            Choose your speaker
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="px-6 pt-2">
          <div className="flex gap-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab("my-avatars")}
              className={cn(
                "pb-3 text-sm font-medium transition-colors relative",
                activeTab === "my-avatars"
                  ? "text-white"
                  : "text-white/50 hover:text-white/70"
              )}
            >
              My Avatars
              {activeTab === "my-avatars" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("public-avatars")}
              className={cn(
                "pb-3 text-sm font-medium transition-colors relative",
                activeTab === "public-avatars"
                  ? "text-white"
                  : "text-white/50 hover:text-white/70"
              )}
            >
              Public Avatars
              {activeTab === "public-avatars" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-4">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-cyan-400/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="border border-white/10 hover:bg-white/5"
            >
              <Filter className="w-4 h-4 text-white/60" />
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-6 pt-4">
          <div className="flex flex-wrap gap-2">
            {AVATAR_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  activeCategory === category.id
                    ? "bg-cyan-500 text-[#0a0a0a]"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Avatar Grid */}
        <ScrollArea className="flex-1 px-6 py-4 max-h-[400px]">
          {activeTab === "my-avatars" ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-white/80 text-lg font-medium mb-2">
                No custom avatars yet
              </h3>
              <p className="text-white/50 text-sm text-center max-w-xs">
                Create your own custom avatar or choose from our public avatar library
              </p>
            </div>
          ) : filteredAvatars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-white/80 text-lg font-medium mb-2">
                No avatars found
              </h3>
              <p className="text-white/50 text-sm">
                Try adjusting your search or filter
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredAvatars.map((avatar) => (
                <AvatarCard
                  key={avatar.id}
                  avatar={avatar}
                  isSelected={selectedAvatar?.id === avatar.id}
                  onClick={() => handleSelectAvatar(avatar)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


