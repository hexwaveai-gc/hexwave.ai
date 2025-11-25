"use client";

/**
 * FileUploader Component
 * Unified upload component supporting images, videos, PDFs, and all file types
 * 
 * @see README.md for documentation
 */

import { memo, useState, useCallback, useMemo } from "react";
import { 
  ImageIcon, 
  Video, 
  FileText, 
  Upload, 
  File,
  Plus,
  X,
  type LucideIcon 
} from "lucide-react";
import { UploadButton, UploadDropzone } from "@/utils/uploadthing";
import { FilePreview, detectFileType, type FileType } from "./FilePreview";
import { cn } from "@/lib/utils";
import HexwaveLoader from "../HexwaveLoader";
import type { FileRouteEndpoint } from "@/app/api/uploadthing/core";

// Type definitions
export type AcceptedFileType = "image" | "video" | "pdf" | "all";

interface UploadResponse {
  ufsUrl?: string;
  url?: string;
  name: string;
  size: number;
}

interface UploadedFile {
  url: string;
  name?: string;
}

// Configuration for each file type (single vs multi endpoints)
interface FileTypeConfig {
  singleEndpoint: FileRouteEndpoint;
  multiEndpoint: FileRouteEndpoint;
  icon: LucideIcon;
  defaultLabel: string;
  defaultDropzoneLabel: string;
  defaultAllowedContent: string;
}

const FILE_TYPE_CONFIG: Record<AcceptedFileType, FileTypeConfig> = {
  image: {
    singleEndpoint: "imageUploader",
    multiEndpoint: "multiImageUploader",
    icon: ImageIcon,
    defaultLabel: "Upload Image",
    defaultDropzoneLabel: "Click or Drop Image",
    defaultAllowedContent: "PNG, JPG, GIF, WebP up to 16MB",
  },
  video: {
    singleEndpoint: "videoUploader",
    multiEndpoint: "multiVideoUploader",
    icon: Video,
    defaultLabel: "Upload Video",
    defaultDropzoneLabel: "Click or Drop Video",
    defaultAllowedContent: "MP4, MOV, WebM up to 256MB",
  },
  pdf: {
    singleEndpoint: "pdfUploader",
    multiEndpoint: "multiPdfUploader",
    icon: FileText,
    defaultLabel: "Upload PDF",
    defaultDropzoneLabel: "Click or Drop PDF",
    defaultAllowedContent: "PDF up to 32MB",
  },
  all: {
    singleEndpoint: "fileUploader",
    multiEndpoint: "fileUploader",
    icon: Upload,
    defaultLabel: "Upload File",
    defaultDropzoneLabel: "Click or Drop File",
    defaultAllowedContent: "Images, Videos, PDFs supported",
  },
};

// Shared appearance configuration
const createSharedAppearance = (accentColor?: string) => ({
  button: cn(
    accentColor 
      ? `!bg-[${accentColor}] hover:!bg-[${accentColor}]/90 ut-uploading:!bg-[${accentColor}]/70`
      : "!bg-[var(--color-theme-2)] hover:!bg-[var(--color-theme-2)]/90 ut-uploading:!bg-[var(--color-theme-2)]/70",
    "!text-black text-sm font-medium",
    "px-4 py-2 rounded-lg"
  ),
  allowedContent: "text-xs text-gray-500 dark:text-[var(--color-text-3)] mt-2",
});

/**
 * Props for the FileUploader component
 * 
 * @example
 * ```tsx
 * // Single image upload
 * <FileUploader accept="image" value={url} onChange={setUrl} />
 * 
 * // Multiple images with dropzone
 * <FileUploader accept="image" maxFiles={4} variant="dropzone" value={urls} onChange={setUrls} />
 * 
 * // Video upload with custom label
 * <FileUploader accept="video" buttonLabel="Add Video" value={videoUrl} onChange={setVideoUrl} />
 * ```
 */
export interface FileUploaderProps {
  /**
   * Type of files to accept
   * @default "image"
   * @example accept="video"
   */
  accept?: AcceptedFileType;

  /**
   * Maximum number of files allowed
   * - `1` = Single file mode (value is `string | null`)
   * - `>1` = Multi file mode (value is `string[]`)
   * @default 1
   * @example maxFiles={4}
   */
  maxFiles?: number;

  /**
   * Upload UI variant
   * - `"button"` - Compact button with dashed border
   * - `"dropzone"` - Larger drag-and-drop area
   * @default "button"
   */
  variant?: "button" | "dropzone";

  /**
   * Current file URL(s) - controlled value
   * - Single mode: `string | null`
   * - Multi mode: `string[]`
   * @example value={imageUrl}
   * @example value={imageUrls}
   */
  value?: string | string[] | null;

  /**
   * File names for display (parallel array to value when multiple)
   * @example fileNames="avatar.png"
   * @example fileNames={["photo1.jpg", "photo2.jpg"]}
   */
  fileNames?: string | string[];

  /**
   * Callback when files change (upload or remove)
   * - Single mode: `(url: string | null) => void`
   * - Multi mode: `(urls: string[]) => void`
   * @example onChange={(url) => setImageUrl(url)}
   * @example onChange={(urls) => setImageUrls(urls || [])}
   */
  onChange?: (value: string | string[] | null, fileNames?: string | string[]) => void;

  /**
   * Callback when upload completes successfully
   * Called with the uploaded URL and full response object
   * @example onUploadComplete={(url, res) => console.log('Uploaded:', res.name)}
   */
  onUploadComplete?: (url: string, response: UploadResponse) => void;

  /**
   * Callback when upload fails
   * @example onUploadError={(error) => toast.error(error.message)}
   */
  onUploadError?: (error: Error) => void;

  /**
   * Callback when upload starts
   * @example onUploadBegin={() => setLoading(true)}
   */
  onUploadBegin?: () => void;

  /**
   * Custom label text for button variant
   * @default Auto-generated based on accept type (e.g., "Upload Image")
   * @example buttonLabel="Add Photo"
   */
  buttonLabel?: string;

  /**
   * Custom label text for dropzone variant
   * @default Auto-generated based on accept type (e.g., "Click or Drop Image")
   * @example dropzoneLabel="Drag your video here"
   */
  dropzoneLabel?: string;

  /**
   * Custom allowed content description text
   * @default Auto-generated based on accept type (e.g., "PNG, JPG, GIF, WebP up to 16MB")
   * @example allowedContent="Max 5MB, PNG or JPG only"
   */
  allowedContent?: string;

  /**
   * Whether upload is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Error state for styling (red border)
   * @default false
   * @example hasError={!!errors.avatar}
   */
  hasError?: boolean;

  /**
   * Additional CSS classes for the container
   * @example className="w-full max-w-md"
   */
  className?: string;

  /**
   * Tailwind height class for preview
   * @default "h-32"
   * @example previewHeight="h-48"
   * @example previewHeight="h-64"
   */
  previewHeight?: string;

  /**
   * Whether to show preview after upload
   * @default true
   */
  showPreview?: boolean;

  /**
   * Custom accent color for the upload button (CSS color value)
   * @example accentColor="#3B82F6"
   * @example accentColor="var(--brand-color)"
   */
  accentColor?: string;

  /**
   * Custom icon to display (from lucide-react)
   * @default Auto-selected based on accept type
   * @example icon={Camera}
   */
  icon?: LucideIcon;

  /**
   * Whether preview is read-only (hides remove button)
   * @default false
   */
  readOnlyPreview?: boolean;

  /**
   * Whether to show video controls in preview
   * @default true
   */
  showVideoControls?: boolean;

  /**
   * Number of columns for multi-file preview grid
   * @default 3
   * @example previewColumns={2}
   * @example previewColumns={4}
   */
  previewColumns?: 2 | 3 | 4;
}

/**
 * Unified file upload component supporting images, videos, PDFs, and all file types.
 * 
 * Features:
 * - Single or multiple file uploads via `maxFiles` prop
 * - Button or dropzone variants
 * - Auto-preview with type-appropriate rendering
 * - Dark mode support
 * - Full accessibility
 * 
 * @example
 * ```tsx
 * // Single image upload
 * <FileUploader
 *   accept="image"
 *   value={imageUrl}
 *   onChange={setImageUrl}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Multiple images with dropzone
 * <FileUploader
 *   accept="image"
 *   maxFiles={4}
 *   variant="dropzone"
 *   value={imageUrls}
 *   onChange={setImageUrls}
 *   previewColumns={2}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Video upload with callbacks
 * <FileUploader
 *   accept="video"
 *   value={videoUrl}
 *   onChange={setVideoUrl}
 *   onUploadBegin={() => setLoading(true)}
 *   onUploadComplete={(url) => setLoading(false)}
 *   onUploadError={(err) => toast.error(err.message)}
 * />
 * ```
 * 
 * @see README.md for full documentation
 */
export const FileUploader = memo(function FileUploader({
  accept = "image",
  maxFiles = 1,
  variant = "button",
  value,
  fileNames,
  onChange,
  onUploadComplete,
  onUploadError,
  onUploadBegin,
  buttonLabel,
  dropzoneLabel,
  allowedContent,
  disabled = false,
  hasError = false,
  className,
  previewHeight = "h-32",
  showPreview = true,
  accentColor,
  icon: CustomIcon,
  readOnlyPreview = false,
  showVideoControls = true,
  previewColumns = 3,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Determine if multi-file mode
  const isMultiMode = maxFiles > 1;
  
  // Normalize value to array for consistent handling
  const filesArray: UploadedFile[] = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) {
      const names = Array.isArray(fileNames) ? fileNames : [];
      return value.map((url, i) => ({ url, name: names[i] }));
    }
    return [{ url: value, name: typeof fileNames === 'string' ? fileNames : undefined }];
  }, [value, fileNames]);

  // Get configuration for the selected file type
  const config = useMemo(() => FILE_TYPE_CONFIG[accept], [accept]);
  
  // Select appropriate endpoint based on single/multi mode
  const endpoint = useMemo(
    () => isMultiMode ? config.multiEndpoint : config.singleEndpoint,
    [isMultiMode, config]
  );
  
  // Resolve labels with defaults
  const resolvedButtonLabel = buttonLabel || config.defaultLabel;
  const resolvedDropzoneLabel = dropzoneLabel || config.defaultDropzoneLabel;
  const resolvedAllowedContent = allowedContent || 
    (isMultiMode 
      ? `${config.defaultAllowedContent} (up to ${maxFiles} files)` 
      : config.defaultAllowedContent);
  const IconComponent = CustomIcon || config.icon;

  // Shared appearance styles
  const sharedAppearance = useMemo(
    () => createSharedAppearance(accentColor),
    [accentColor]
  );

  // Check if can upload more files
  const canUploadMore = filesArray.length < maxFiles;

  // Handle upload start
  const handleUploadBegin = useCallback(() => {
    setIsUploading(true);
    setUploadProgress(0);
    onUploadBegin?.();
  }, [onUploadBegin]);

  // Handle successful upload
  const handleUploadComplete = useCallback(
    (res: UploadResponse[]) => {
      setIsUploading(false);
      setUploadProgress(0);
      
      if (isMultiMode) {
        // Multi-file mode: append new files to existing
        const newFiles = res.map(file => file.ufsUrl || file.url).filter(Boolean) as string[];
        const newNames = res.map(file => file.name);
        const currentUrls = filesArray.map(f => f.url);
        const currentNames = filesArray.map(f => f.name || '');
        
        const updatedUrls = [...currentUrls, ...newFiles].slice(0, maxFiles);
        const updatedNames = [...currentNames, ...newNames].slice(0, maxFiles);
        
        onChange?.(updatedUrls, updatedNames);
        
        // Call onUploadComplete for each new file
        res.forEach(file => {
          const url = file.ufsUrl || file.url;
          if (url) onUploadComplete?.(url, file);
        });
      } else {
        // Single file mode: replace
        const uploadedFile = res?.[0];
        const uploadedUrl = uploadedFile?.ufsUrl || uploadedFile?.url;

        if (uploadedUrl) {
          onChange?.(uploadedUrl, uploadedFile?.name);
          onUploadComplete?.(uploadedUrl, uploadedFile);
        }
      }
    },
    [isMultiMode, filesArray, maxFiles, onChange, onUploadComplete]
  );

  // Handle upload error
  const handleUploadError = useCallback(
    (error: Error) => {
      setIsUploading(false);
      setUploadProgress(0);
      console.error("Upload failed:", error);

      if (onUploadError) {
        onUploadError(error);
      } else {
        alert(`Upload failed: ${error.message}`);
      }
    },
    [onUploadError]
  );

  // Handle removing a single file
  const handleRemoveFile = useCallback((index: number) => {
    if (isMultiMode) {
      const newUrls = filesArray.filter((_, i) => i !== index).map(f => f.url);
      const newNames = filesArray.filter((_, i) => i !== index).map(f => f.name || '');
      onChange?.(newUrls.length > 0 ? newUrls : null, newNames);
    } else {
      onChange?.(null);
    }
  }, [isMultiMode, filesArray, onChange]);

  // Handle removing all files
  const handleRemoveAll = useCallback(() => {
    onChange?.(isMultiMode ? [] : null);
  }, [isMultiMode, onChange]);

  // Detect file type for preview
  const getFileType = useCallback((url: string): FileType => {
    if (accept !== "all") return accept;
    return detectFileType(url);
  }, [accept]);

  // Render multi-file preview grid
  if (isMultiMode && filesArray.length > 0 && showPreview) {
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
              onClick={handleRemoveAll}
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
                  onClick={() => handleRemoveFile(index)}
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
                onUploadBegin={handleUploadBegin}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
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

  // Single file with preview
  if (!isMultiMode && filesArray.length > 0 && showPreview) {
    return (
      <FilePreview
        src={filesArray[0].url}
        fileType={getFileType(filesArray[0].url)}
        fileName={filesArray[0].name}
        onRemove={readOnlyPreview ? undefined : () => handleRemoveFile(0)}
        className={className}
        previewHeight={previewHeight}
        rounded={variant === "dropzone" ? "xl" : "lg"}
        showVideoControls={showVideoControls}
        readOnly={readOnlyPreview}
      />
    );
  }

  // Render button variant (empty state)
  if (variant === "button") {
    return (
      <div className={cn("relative w-full", className)}>
        <UploadButton
          endpoint={endpoint}
          disabled={disabled}
          onUploadBegin={handleUploadBegin}
          onClientUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          onUploadProgress={setUploadProgress}
          appearance={{
            container: cn(
              "relative flex w-full cursor-pointer flex-col items-center justify-center",
              "rounded-lg border-2 border-dashed transition-all duration-300",
              // Expand height during upload to accommodate the loader (sm = 64px + text + gaps)
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

  // Render dropzone variant (empty state)
  return (
    <UploadDropzone
      endpoint={endpoint}
      disabled={disabled}
      onUploadBegin={handleUploadBegin}
      onClientUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      onUploadProgress={setUploadProgress}
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
        button: isUploading 
          ? "!hidden" 
          : sharedAppearance.button,
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
});

/**
 * Dropzone Icon Component
 */
function DropzoneIcon({ Icon }: { Icon: LucideIcon }) {
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

/**
 * Upload Progress Bar Component
 * Styled progress bar with percentage display
 */
function UploadProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full max-w-[180px] space-y-2">
      {/* Progress bar container */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/20 dark:bg-white/10">
        {/* Animated background glow */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(90deg, transparent, var(--color-theme-2), transparent)`,
            animation: 'shimmer 2s infinite',
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

