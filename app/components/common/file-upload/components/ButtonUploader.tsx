"use client";

import type { LucideIcon } from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";
import { cn } from "@/lib/utils";
import HexwaveLoader from "../../HexwaveLoader";
import { UploadProgressBar } from "./UploadProgressBar";
import type { FileRouteEndpoint } from "@/app/api/uploadthing/core";
import type { UploadResponse } from "../types";

interface ButtonUploaderProps {
  endpoint: FileRouteEndpoint;
  disabled: boolean;
  isUploading: boolean;
  uploadProgress: number;
  previewHeight: string;
  resolvedButtonLabel: string;
  resolvedAllowedContent: string;
  IconComponent: LucideIcon;
  className?: string;
  sharedAppearance: {
    button: string;
    allowedContent: string;
  };
  onUploadBegin: () => void;
  onUploadComplete: (res: UploadResponse[]) => void;
  onUploadError: (error: Error) => void;
  onUploadProgress: (progress: number) => void;
}

/**
 * Button Uploader Component
 * Compact button variant for file uploads with dashed border styling
 */
export function ButtonUploader({
  endpoint,
  disabled,
  isUploading,
  uploadProgress,
  previewHeight,
  resolvedButtonLabel,
  resolvedAllowedContent,
  IconComponent,
  className,
  sharedAppearance,
  onUploadBegin,
  onUploadComplete,
  onUploadError,
  onUploadProgress,
}: ButtonUploaderProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <UploadButton
        endpoint={endpoint}
        disabled={disabled}
        onUploadBegin={onUploadBegin}
        onClientUploadComplete={onUploadComplete}
        onUploadError={onUploadError}
        onUploadProgress={onUploadProgress}
        appearance={{
          container: cn(
            "relative flex w-full cursor-pointer flex-col items-center justify-center",
            "rounded-lg border-2 border-dashed transition-all duration-300",
            // Expand height during upload to accommodate the loader
            isUploading ? "min-h-[160px]" : previewHeight,
            isUploading
              ? "border-[var(--color-theme-2)]/50 bg-[var(--color-theme-2)]/5 dark:bg-[var(--color-theme-2)]/10"
              : cn(
                  "border-gray-300 bg-gray-50",
                  "hover:border-gray-400 hover:bg-gray-100",
                  "dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)]",
                  "dark:hover:border-[var(--color-border-component)] dark:hover:bg-[var(--color-bg-secondary)]"
                )
          ),
          // Hide button completely during upload
          button: isUploading ? "!hidden" : sharedAppearance.button,
          allowedContent: sharedAppearance.allowedContent,
        }}
        content={{
          button: () => (
            <span className="flex items-center gap-2">
              <IconComponent className="h-4 w-4" />
              {resolvedButtonLabel}
            </span>
          ),
          allowedContent: () =>
            isUploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <HexwaveLoader size="sm" />
                <UploadProgressBar progress={uploadProgress} />
              </div>
            ) : (
              <span>{resolvedAllowedContent}</span>
            ),
        }}
      />
    </div>
  );
}

