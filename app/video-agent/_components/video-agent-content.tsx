"use client";

import { useState, useCallback } from "react";
import type { Avatar } from "@/constants/video-agent";
import { HeroSection } from "./hero-section";
import { PromptInput } from "./prompt-input";
import { AvatarPickerModal } from "./avatar-picker-modal";
import { BetaDialog } from "./beta-dialog";

export function VideoAgentContent() {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isBetaDialogOpen, setIsBetaDialogOpen] = useState(false);

  const handleAvatarClick = useCallback(() => {
    setIsAvatarModalOpen(true);
  }, []);

  const handleSelectAvatar = useCallback((avatar: Avatar) => {
    setSelectedAvatar(avatar);
  }, []);

  const handleSubmit = useCallback((prompt: string) => {
    // Show beta dialog when user tries to generate
    setIsBetaDialogOpen(true);
    console.log("Prompt submitted:", prompt);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Beta Badge - Fixed at top center */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-20 ml-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-medium text-cyan-400">Beta</span>
        </div>
      </div>

      {/* Main Content - Centered with bottom padding for input */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-48">
        <HeroSection />
      </div>

      {/* Fixed Bottom Input */}
      <div className="fixed bottom-0 left-20 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <PromptInput
            selectedAvatar={selectedAvatar}
            onAvatarClick={handleAvatarClick}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        open={isAvatarModalOpen}
        onOpenChange={setIsAvatarModalOpen}
        selectedAvatar={selectedAvatar}
        onSelectAvatar={handleSelectAvatar}
      />

      {/* Beta Dialog */}
      <BetaDialog
        open={isBetaDialogOpen}
        onOpenChange={setIsBetaDialogOpen}
      />
    </div>
  );
}

