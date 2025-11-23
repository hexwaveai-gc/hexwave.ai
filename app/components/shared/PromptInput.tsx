"use client";

import { ReactNode } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  /** Current value of the prompt */
  value: string;
  
  /** Change handler for prompt value */
  onChange: (value: string) => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Whether this field is required */
  required?: boolean;
  
  /** Minimum height of the textarea */
  minHeight?: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Optional helper buttons to display in bottom-right */
  helperButtons?: ReactNode;
  
  /** Label text (defaults to "Prompt") */
  label?: string;
}

/**
 * Shared prompt input component with textarea
 * Used across image and video generators for consistent UX
 * 
 * Reasoning: Extracted common prompt input pattern to eliminate duplication
 * Supports optional helper buttons (e.g., DeepSeek, Help Center)
 */
export default function PromptInput({
  value,
  onChange,
  placeholder = "Describe your creative ideas...",
  required = true,
  minHeight = "200px",
  className,
  helperButtons,
  label = "Prompt",
}: PromptInputProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "resize-none rounded-lg border-gray-200 bg-gray-50 p-4 text-base focus:border-blue-500 focus:ring-0 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)] dark:placeholder:text-[var(--color-text-3)]",
            helperButtons && "pb-12"
          )}
          style={{ minHeight }}
        />
        {helperButtons && (
          <div className="absolute bottom-3 right-3 flex items-center gap-4">
            {helperButtons}
          </div>
        )}
      </div>
    </div>
  );
}

