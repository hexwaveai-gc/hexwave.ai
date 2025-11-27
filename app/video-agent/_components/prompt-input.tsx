"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, Smartphone, Monitor, Send, User } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  type Avatar,
  type DurationOption,
  type DeviceType,
  DURATION_OPTIONS,
  getRandomPlaceholder,
} from "@/constants/video-agent";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface PromptInputProps {
  selectedAvatar: Avatar | null;
  onAvatarClick: () => void;
  onSubmit: (prompt: string) => void;
}

export function PromptInput({
  selectedAvatar,
  onAvatarClick,
  onSubmit,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<DurationOption>("auto");
  const [deviceType, setDeviceType] = useState<DeviceType>("mobile");
  const [placeholder, setPlaceholder] = useState("");

  // Set random placeholder on mount
  useEffect(() => {
    setPlaceholder(getRandomPlaceholder());
  }, []);

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectedDuration = DURATION_OPTIONS.find((d) => d.id === duration);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-4">
        {/* Avatar Selector */}
        <button
          onClick={onAvatarClick}
          className="flex items-center gap-3 mb-4 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors w-fit"
        >
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
            {selectedAvatar ? (
              <Image
                src={selectedAvatar.previewUrl}
                alt={selectedAvatar.name}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white/50" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">
              {selectedAvatar?.name || "Auto"}
            </p>
            <p className="text-xs text-white/50">Speaker</p>
          </div>
        </button>

        {/* Prompt Input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder:text-white/40 resize-none outline-none text-sm leading-relaxed min-h-[60px] mb-4"
          rows={2}
        />

        {/* Bottom Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Add Button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <Plus className="w-4 h-4 text-white/60" />
            </Button>

            {/* Duration Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 gap-2"
                >
                  <Clock className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/80">
                    {selectedDuration?.label}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="bg-[#1a1a1a] border-white/10"
              >
                {DURATION_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => setDuration(option.id)}
                    className={cn(
                      "text-white/70 hover:text-white hover:bg-white/10",
                      duration === option.id && "text-cyan-400"
                    )}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Device Type Toggle */}
            <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5">
              <button
                onClick={() => setDeviceType("mobile")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  deviceType === "mobile"
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white"
                )}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceType("desktop")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  deviceType === "desktop"
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white"
                )}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className={cn(
              "w-10 h-10 rounded-full p-0 transition-all",
              prompt.trim()
                ? "bg-cyan-500 hover:bg-cyan-400 text-[#0a0a0a]"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

