'use client';

import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Lightbulb, HelpCircle } from 'lucide-react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Prompt input component with helper links
 * Displays a large textarea for user prompt input with DeepSeek and Help Center links
 * 
 * Reasoning: Encapsulates prompt input logic and styling for reusability
 */
export function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="prompt" className="text-sm font-medium">
          Prompt <span className="text-destructive">(Required)</span>
        </Label>
      </div>
      <div className="relative">
        <Textarea
          id="prompt"
          placeholder="Please describe your creative ideas for the video, or have DeepSeek generate the prompt or view Help Center for a quick start."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px] resize-none text-sm"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Lightbulb className="h-4 w-4" />
            <span className="underline">DeepSeek</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="underline">Help Center</span>
          </button>
        </div>
      </div>
    </div>
  );
}

