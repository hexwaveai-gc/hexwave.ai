"use client";

import { cn } from "@/lib/utils";

interface UploadProgressBarProps {
  progress: number;
}

/**
 * Upload Progress Bar Component
 * Styled progress bar with percentage display and shimmer animation
 */
export function UploadProgressBar({ progress }: UploadProgressBarProps) {
  return (
    <div className="w-full max-w-[180px] space-y-2">
      {/* Progress bar container */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/20 dark:bg-white/10">
        {/* Animated background glow */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(90deg, transparent, var(--color-theme-2), transparent)`,
            animation: "shimmer 2s infinite",
          }}
        />
        {/* Progress fill */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            "bg-linear-to-r from-(--color-theme-2) to-(--color-theme-2)/80"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Percentage text */}
      <p className="text-center text-xs font-medium text-(--color-text-2) dark:text-(--color-text-3)">
        Uploading... {progress}%
      </p>
    </div>
  );
}


