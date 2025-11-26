"use client";

import type { LucideIcon } from "lucide-react";
import { UploadDropzone } from "@/utils/uploadthing";
import { cn } from "@/lib/utils";
import HexwaveLoader from "../../HexwaveLoader";
import { DropzoneIcon } from "./DropzoneIcon";
import { UploadProgressBar } from "./UploadProgressBar";
import type { FileRouteEndpoint } from "@/app/api/uploadthing/core";
import type { UploadResponse } from "../types";
import { ReactNode } from "react";

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
  footer?: ReactNode;
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
  footer,
}: DropzoneUploaderProps) {
  return (
    <div className={cn("relative flex flex-col gap-2", className)}>
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
            "relative w-full rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
            // Light mode styling
            "border-gray-200 bg-gray-50",
            "hover:border-gray-300 hover:bg-gray-100",
            // Dark mode styling - matching image-generator
            "dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)]",
            "dark:hover:border-[var(--color-border-component)] dark:hover:bg-[var(--color-bg-secondary)]",
            // Loading state
            isUploading ? "p-8 flex items-center justify-center min-h-[200px]" : "p-6",
            // Active drag/uploading state
            isUploading && "border-[var(--color-theme-2)]/50 bg-[var(--color-theme-2)]/5"
          ),
          uploadIcon: "hidden",
          label: cn(
            "text-sm font-medium mt-4",
            isUploading
              ? "text-[var(--color-theme-2)]"
              : "text-gray-700 dark:text-[var(--color-text-2)]"
          ),
          allowedContent:
            "text-[11px] text-gray-500 dark:text-[var(--color-text-3)] mt-1",
          // Completely hide default button to make whole area clickable
          button: "hidden",
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
              <span className="text-sm font-medium text-gray-700 dark:text-(--color-text-2)">{resolvedDropzoneLabel}</span>
            ),
          allowedContent: () =>
            isUploading ? null : (
              <span className="mt-1.5 block text-xs text-gray-500 dark:text-(--color-text-3)">{resolvedAllowedContent}</span>
            ),
        }}
      />
      {footer && (
        <div className="mt-1">
          {footer}
        </div>
      )}
    </div>
  );
}
