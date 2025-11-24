"use client";

import { Button } from "../ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  /** Click handler for generate action */
  onClick: () => void;
  
  /** Whether the button is disabled */
  disabled?: boolean;
  
  /** Whether generation is in progress */
  isLoading?: boolean;
  
  /** Button variant (defaults to "generate") */
  variant?: "generate" | "neon" | "default" | "tf-primary" | "tf-secondary" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  
  /** Button text (defaults to "Generate") */
  text?: string;
  
  /** Show icon (defaults to true) */
  showIcon?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Credits required for generation (optional display) */
  creditsRequired?: number;
}

/**
 * Shared generate button component
 * Used across image and video generators for consistent UX
 * 
 * Reasoning: Extracted common generate button pattern to eliminate duplication
 * Supports multiple variants, loading states, and credit display
 */
export default function GenerateButton({
  onClick,
  disabled = false,
  isLoading = false,
  variant = "generate",
  text = "Generate",
  showIcon = true,
  className,
  creditsRequired,
}: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      variant={variant}
      className={cn(
        "h-10 min-w-[140px] rounded-lg px-8 transition-all",
        isLoading && "cursor-wait",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          {showIcon && <Wand2 className="mr-2 h-4 w-4" />}
          {text}
          {creditsRequired && (
            <span className="ml-2 text-xs opacity-75">
              ({creditsRequired} {creditsRequired === 1 ? "credit" : "credits"})
            </span>
          )}
        </>
      )}
    </Button>
  );
}

