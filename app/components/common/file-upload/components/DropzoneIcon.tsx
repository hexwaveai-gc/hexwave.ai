"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneIconProps {
  Icon: LucideIcon;
}

/**
 * Dropzone Icon Component
 * Icon with decorative plus badge for dropzone upload areas
 */
export function DropzoneIcon({ Icon }: DropzoneIconProps) {
  return (
    <div className="relative mb-1">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          // Dark theme specific colors to match the card
          "bg-[#222] text-gray-400",
          "border border-[#333]"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div
        className={cn(
          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full",
          "flex items-center justify-center",
          "bg-white text-black", // High contrast plus badge
          "border-2 border-[#111]" // Match card background for cutout effect
        )}
      >
        <span className="text-[10px] font-bold leading-none">+</span>
      </div>
    </div>
  );
}
