"use client";

import { SlidersHorizontal, Wand2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Slider } from "@/app/components/ui/slider";
import { Switch } from "@/app/components/ui/switch";
import { cn } from "@/lib/utils";
import type { VoiceSettingsState } from "./audio-content";

interface VoiceSettingsProps {
  settings: VoiceSettingsState;
  onSettingsChange: (settings: VoiceSettingsState) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceSettings({
  settings,
  onSettingsChange,
  isOpen,
  onOpenChange,
}: VoiceSettingsProps) {
  const updateSetting = <K extends keyof VoiceSettingsState>(
    key: K,
    value: VoiceSettingsState[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="flex items-center gap-1">
      {/* Settings Button */}
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-lg",
              "bg-[#1a1a1a] border border-white/10",
              "hover:bg-[#222] hover:border-white/20",
              "transition-all duration-200",
              isOpen && "bg-white/10 border-white/20"
            )}
            title="Voice Settings"
          >
            <SlidersHorizontal className="w-4 h-4 text-white/70" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-80 p-4 bg-[#1a1a1a] border-white/10 rounded-xl"
          align="start"
          sideOffset={8}
        >
          <h3 className="text-sm font-semibold text-white mb-4">Voice Settings</h3>

          <div className="space-y-5">
            {/* Stability */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/70">Stability</label>
                <span className="text-xs text-white/50 tabular-nums">
                  {Math.round(settings.stability * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.stability]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={([value]) => updateSetting("stability", value)}
                className="w-full"
              />
              <p className="text-xs text-white/40">
                Higher stability = more consistent, lower = more expressive
              </p>
            </div>

            {/* Similarity Boost */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/70">Similarity Boost</label>
                <span className="text-xs text-white/50 tabular-nums">
                  {Math.round(settings.similarityBoost * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.similarityBoost]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={([value]) => updateSetting("similarityBoost", value)}
                className="w-full"
              />
              <p className="text-xs text-white/40">
                Higher = closer to original voice, lower = more variety
              </p>
            </div>

            {/* Style Exaggeration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/70">Style Exaggeration</label>
                <span className="text-xs text-white/50 tabular-nums">
                  {Math.round(settings.styleExaggeration * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.styleExaggeration]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={([value]) => updateSetting("styleExaggeration", value)}
                className="w-full"
              />
              <p className="text-xs text-white/40">
                Amplifies the style of the original voice
              </p>
            </div>

            {/* Speaker Boost */}
            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm text-white/70 block">Speaker Boost</label>
                <p className="text-xs text-white/40 mt-0.5">
                  Enhance voice clarity
                </p>
              </div>
              <Switch
                checked={settings.speakerBoost}
                onCheckedChange={(checked) => updateSetting("speakerBoost", checked)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Magic Wand Button */}
      <button
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-lg",
          "bg-[#1a1a1a] border border-white/10",
          "hover:bg-[#222] hover:border-white/20",
          "transition-all duration-200"
        )}
        title="Auto-enhance"
      >
        <Wand2 className="w-4 h-4 text-white/70" />
      </button>
    </div>
  );
}



