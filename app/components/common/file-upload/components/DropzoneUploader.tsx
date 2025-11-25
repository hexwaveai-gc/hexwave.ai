"use client";

import type { LucideIcon } from "lucide-react";
import { UploadDropzone } from "@/utils/uploadthing";
import { cn } from "@/lib/utils";
import HexwaveLoader from "../../HexwaveLoader";
import { DropzoneIcon } from "./DropzoneIcon";
import { UploadProgressBar } from "./UploadProgressBar";
import type { FileRouteEndpoint } from "@/app/api/uploadthing/core";
import type { UploadResponse } from "../types";

interface DropzoneUploaderProps {
  endpoint: FileRouteEndpoint;
  disabled: boolean;
  isUploading: boolean;
  uploadProgress: number;
  resolvedDropzoneLabel: string;
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
 * Dropzone Uploader Component
 * Larger drag-and-drop area for file uploads
 */
export function DropzoneUploader({
  endpoint,
  disabled,
  isUploading,
  uploadProgress,
  resolvedDropzoneLabel,
  resolvedAllowedContent,
  IconComponent,
  className,
  sharedAppearance,
  onUploadBegin,
  onUploadComplete,
  onUploadError,
  onUploadProgress,
}: DropzoneUploaderProps) {
  return (
    <UploadDropzone
      endpoint={endpoint}
      disabled={disabled}
      onUploadBegin={onUploadBegin}
      onClientUploadComplete={onUploadComplete}
      onUploadError={onUploadError}
      onUploadProgress={onUploadProgress}
      config={{ mode: "auto" }}
      appearance={{
        container: cn(
          "relative w-full rounded-[18px] border transition-all duration-300 cursor-pointer",
          // Add more padding during upload for the loader
          isUploading ? "p-8 flex items-center justify-center min-h-[200px]" : "p-6",
          isUploading
            ? "border-[var(--color-theme-2)]/50 bg-[var(--color-theme-2)]/5 dark:bg-[var(--color-theme-2)]/10"
            : cn(
                "border-gray-200 bg-gray-50/50",
                "hover:bg-gray-50/80",
                "dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)]/50",
                "dark:hover:bg-[var(--color-bg-primary)]/80"
              ),
          className
        ),
        uploadIcon: "hidden",
        label: cn(
          "text-sm font-medium",
          isUploading
            ? "text-[var(--color-theme-2)]"
            : "text-gray-900 dark:text-[var(--color-text-1)] hover:text-[var(--color-theme-2)]"
        ),
        allowedContent:
          "text-[10px] text-gray-500/60 dark:text-[var(--color-text-3)]/60",
        // Completely hide button during upload
        button: isUploading ? "!hidden" : sharedAppearance.button,
      }}
      content={{
        uploadIcon: () =>
          isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <HexwaveLoader size="sm" />
              <UploadProgressBar progress={uploadProgress} />
            </div>
          ) : (
            <DropzoneIcon Icon={IconComponent} />
          ),
        label: () =>
          isUploading ? null : (
            <span className="text-sm font-medium">{resolvedDropzoneLabel}</span>
          ),
        allowedContent: () =>
          isUploading ? null : (
            <span className="mt-2 block">{resolvedAllowedContent}</span>
          ),
      }}
    />
  );
}

