"use client";

import { Plus, X } from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";
import { FilePreview, type FileType } from "../FilePreview";
import { cn } from "@/lib/utils";
import type { FileRouteEndpoint } from "@/app/api/uploadthing/core";
import type { UploadedFile, UploadResponse } from "../types";

interface MultiFilePreviewProps {
  filesArray: UploadedFile[];
  maxFiles: number;
  previewHeight: string;
  previewColumns: 2 | 3 | 4;
  showVideoControls: boolean;
  readOnlyPreview: boolean;
  disabled: boolean;
  canUploadMore: boolean;
  endpoint: FileRouteEndpoint;
  className?: string;
  getFileType: (url: string) => FileType;
  onRemoveFile: (index: number) => void;
  onRemoveAll: () => void;
  onUploadBegin: () => void;
  onUploadComplete: (res: UploadResponse[]) => void;
  onUploadError: (error: Error) => void;
}

/**
 * Multi-file Preview Grid Component
 * Displays uploaded files in a grid with remove buttons and an add more button
 */
export function MultiFilePreview({
  filesArray,
  maxFiles,
  previewHeight,
  previewColumns,
  showVideoControls,
  readOnlyPreview,
  disabled,
  canUploadMore,
  endpoint,
  className,
  getFileType,
  onRemoveFile,
  onRemoveAll,
  onUploadBegin,
  onUploadComplete,
  onUploadError,
}: MultiFilePreviewProps) {
  const columnClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[previewColumns];

  return (
    <div className={cn("space-y-3", className)}>
      {/* File count indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-(--color-text-3)">
          {filesArray.length} / {maxFiles} files
        </span>
        {!readOnlyPreview && filesArray.length > 1 && (
          <button
            type="button"
            onClick={onRemoveAll}
            className="text-xs text-red-500 hover:text-red-600"
          >
            Remove all
          </button>
        )}
      </div>

      {/* Preview grid */}
      <div className={cn("grid gap-3", columnClass)}>
        {filesArray.map((file, index) => (
          <div key={file.url} className="relative group">
            <FilePreview
              src={file.url}
              fileType={getFileType(file.url)}
              fileName={file.name}
              previewHeight={previewHeight}
              rounded="lg"
              showVideoControls={showVideoControls}
              readOnly={true}
            />
            {!readOnlyPreview && (
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className={cn(
                  "absolute right-1 top-1",
                  "rounded-full bg-black/50 p-1",
                  "text-white opacity-0 backdrop-blur-sm",
                  "transition-opacity hover:bg-black/70",
                  "group-hover:opacity-100"
                )}
                aria-label="Remove file"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}

        {/* Add more button */}
        {canUploadMore && !disabled && (
          <div className={cn("relative", previewHeight)}>
            <UploadButton
              endpoint={endpoint}
              disabled={disabled}
              onUploadBegin={onUploadBegin}
              onClientUploadComplete={onUploadComplete}
              onUploadError={onUploadError}
              appearance={{
                container: cn(
                  "h-full w-full cursor-pointer",
                  "flex flex-col items-center justify-center",
                  "rounded-lg border-2 border-dashed transition-colors",
                  "border-gray-300 bg-gray-50",
                  "hover:border-gray-400 hover:bg-gray-100",
                  "dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)]",
                  "dark:hover:border-[var(--color-border-component)] dark:hover:bg-[var(--color-bg-secondary)]"
                ),
                button: "hidden",
                allowedContent: "hidden",
              }}
              content={{
                button: () => null,
                allowedContent: () => (
                  <div className="flex flex-col items-center gap-1">
                    <Plus className="h-6 w-6 text-gray-400" />
                    <span className="text-[10px] font-medium text-gray-500">Add</span>
                  </div>
                ),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

