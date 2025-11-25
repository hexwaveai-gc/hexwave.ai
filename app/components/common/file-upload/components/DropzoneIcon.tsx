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
    <div className="relative mb-4">
      <div
        className={cn(
          "w-12 h-12 rounded-[18px] flex items-center justify-center",
          "bg-gray-100 dark:bg-(--color-bg-secondary)/50"
        )}
      >
        <Icon className="w-6 h-6 text-gray-500 dark:text-(--color-text-3)" />
      </div>
      <div
        className={cn(
          "absolute -bottom-1 -right-1 w-5 h-5 rounded-full",
          "flex items-center justify-center",
          "bg-(--color-theme-2)",
          "border-2 border-white dark:border-(--color-bg-page)"
        )}
      >
        <span className="text-[10px] font-bold text-black">+</span>
      </div>
    </div>
  );
}

