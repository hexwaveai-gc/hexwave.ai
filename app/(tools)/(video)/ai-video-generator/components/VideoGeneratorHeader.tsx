'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { ThemeToggle } from '@/app/components/ui/theme-toggle';

interface VideoGeneratorHeaderProps {
  selectedModel: string;
  onModelChange: (value: string) => void;
}

/**
 * Header component for the AI Video Generator
 * Displays the title, model selector, and theme toggle
 * 
 * Reasoning: Updated for sidebar layout to be responsive and fit within constraints
 */
export function VideoGeneratorHeader({
  selectedModel,
  onModelChange,
}: VideoGeneratorHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">
        AI Video Generator
      </h1>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video-2.1-master">VIDEO 2.1 Master</SelectItem>
            <SelectItem value="video-2.0">VIDEO 2.0</SelectItem>
            <SelectItem value="video-1.5">VIDEO 1.5</SelectItem>
          </SelectContent>
        </Select>
        <ThemeToggle />
      </div>
    </div>
  );
}
