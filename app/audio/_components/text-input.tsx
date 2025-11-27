"use client";

import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import { AUDIO_MAX_CHARACTER_LIMIT } from "@/constants/audio";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  estimatedDuration: string;
  disabled?: boolean;
}

export function TextInput({
  value,
  onChange,
  isGenerating,
  onGenerate,
  estimatedDuration,
  disabled = false,
}: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const characterCount = value.length;
  const isOverLimit = characterCount > AUDIO_MAX_CHARACTER_LIMIT;
  const canGenerate = value.trim().length > 0 && !isOverLimit && !isGenerating && !disabled;

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f0f] rounded-2xl border border-white/10 overflow-hidden">
      {/* Text Area */}
      <div className="flex-1 p-4 pb-0">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Press Tab to expand, ⌘K for custom instructions"
          disabled={isGenerating}
          className={cn(
            "w-full min-h-[200px] resize-none bg-transparent",
            "text-white placeholder:text-white/40",
            "focus:outline-none",
            "text-base leading-relaxed",
            isGenerating && "opacity-50 cursor-not-allowed"
          )}
          style={{ height: "auto" }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
        {/* Duration Display */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono text-white/50">
            {estimatedDuration}
          </span>

          {/* Character Count */}
          <span
            className={cn(
              "text-xs",
              isOverLimit ? "text-red-400" : "text-white/30"
            )}
          >
            {characterCount.toLocaleString()} / {AUDIO_MAX_CHARACTER_LIMIT.toLocaleString()}
          </span>
        </div>

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={cn(
            "px-6 py-2.5 rounded-xl font-semibold text-sm",
            "bg-[#74FF52] text-[#0a0a0a]",
            "hover:bg-[#66e648]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200"
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
    </div>
  );
}

