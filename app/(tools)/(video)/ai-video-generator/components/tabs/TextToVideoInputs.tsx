"use client";

import { Lightbulb, HelpCircle } from "lucide-react";
import PromptInput from "@/app/components/shared/PromptInput";
import { SoundEffectsToggle } from "../SoundEffectsToggle";

interface TextToVideoInputsProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  soundEffectsEnabled: boolean;
  onSoundEffectsToggle: (enabled: boolean) => void;
  supportsAudio?: boolean;
}

/**
 * Text to Video tab content
 * Uses shared PromptInput component for consistency with image generator
 * 
 * Reasoning: Extracted from page.tsx to follow DRY pattern
 * Reuses shared components and maintains video-specific features
 */
export function TextToVideoInputs({
  prompt,
  onPromptChange,
  soundEffectsEnabled,
  onSoundEffectsToggle,
  supportsAudio = false,
}: TextToVideoInputsProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-page-padding)] py-[var(--spacing-element-gap)]">
        <div className="space-y-6">
          <PromptInput
            value={prompt}
            onChange={onPromptChange}
            placeholder="Please describe your creative ideas for the video, or have DeepSeek generate the prompt or view Help Center for a quick start."
            required={true}
            minHeight="200px"
            helperButtons={
              <>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:text-[var(--color-text-3)] dark:hover:text-[var(--color-text-1)] transition-colors"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span className="underline">DeepSeek</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:text-[var(--color-text-3)] dark:hover:text-[var(--color-text-1)] transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="underline">Help Center</span>
                </button>
              </>
            }
          />

          {supportsAudio && (
            <>
              <SoundEffectsToggle
                enabled={soundEffectsEnabled}
                onToggle={onSoundEffectsToggle}
              />

              {soundEffectsEnabled && (
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/30 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)]/30">
                  <p className="text-sm text-gray-600 dark:text-[var(--color-text-2)] flex items-center justify-between">
                    <span>Integrated sound with video generation</span>
                    <button className="text-gray-900 dark:text-[var(--color-text-1)] text-xs font-medium hover:underline flex items-center gap-1">
                      Advanced
                      <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1L5 5L9 1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

