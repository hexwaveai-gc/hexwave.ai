"use client";

/**
 * FilePreview Component
 * Unified preview component for images, videos, and PDFs
 * 
 * Uses Next.js Image for optimized loading with:
 * - Automatic format optimization (WebP/AVIF)
 * - Lazy loading
 * - Blur placeholder while loading
 * 
 * @see README.md for documentation
 */

import { memo, useMemo } from "react";
import Image from "next/image";
import { X, FileText, Play, Image as ImageIcon, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExpandableMedia, type MediaType } from "./ExpandableMedia";

// File type detection utilities
export type FileType = "image" | "video" | "pdf" | "unknown";

/**
 * Detects file type from URL or filename using extension matching.
 * 
 * @param url - The file URL or path to analyze
 * @returns The detected file type: "image" | "video" | "pdf" | "unknown"
 * 
 * @example
 * ```tsx
 * detectFileType("https://example.com/photo.jpg")  // "image"
 * detectFileType("https://example.com/video.mp4")  // "video"
 * detectFileType("https://example.com/doc.pdf")    // "pdf"
 * detectFileType("https://example.com/file.xyz")   // "unknown"
 * ```
 */
export function detectFileType(url: string): FileType {
  if (!url) return "unknown";
  
  const lowerUrl = url.toLowerCase();
  
  // Image extensions
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)(\?|$)/i.test(lowerUrl)) {
    return "image";
  }
  
  // Video extensions
  if (/\.(mp4|webm|mov|avi|mkv|m4v|ogv)(\?|$)/i.test(lowerUrl)) {
    return "video";
  }
  
  // PDF extension
  if (/\.pdf(\?|$)/i.test(lowerUrl)) {
    return "pdf";
  }
  
  return "unknown";
}

/**
 * Props for the FilePreview component
 * 
 * @example
 * ```tsx
 * // Image preview
 * <FilePreview src={imageUrl} onRemove={() => setImageUrl(null)} />
 * 
 * // Video preview without controls
 * <FilePreview src={videoUrl} fileType="video" showVideoControls={false} />
 * ```
 */
export interface FilePreviewProps {
  /**
   * File source URL (required)
   * @example src="https://example.com/image.jpg"
   */
  src: string;

  /**
   * Explicit file type (auto-detected from URL if not provided)
   * @default Auto-detected from URL extension
   * @example fileType="video"
   */
  fileType?: FileType;

  /**
   * Alt text for accessibility (images only)
   * @default "Uploaded file"
   */
  alt?: string;

  /**
   * File name to display (for PDF and unknown file types)
   * @example fileName="document.pdf"
   */
  fileName?: string;

  /**
   * Callback when remove button is clicked
   * If not provided, remove button is hidden
   * @example onRemove={() => setUrl(null)}
   */
  onRemove?: () => void;

  /**
   * Additional CSS classes for the container
   * @example className="w-full max-w-md"
   */
  className?: string;

  /**
   * Tailwind height class for the preview
   * @default "h-32"
   * @example previewHeight="h-48"
   */
  previewHeight?: string;

  /**
   * Border radius variant
   * @default "lg"
   * @example rounded="xl"
   */
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl";

  /**
   * Whether to show video controls (videos only)
   * @default true
   */
  showVideoControls?: boolean;

  /**
   * Whether preview is read-only (hides remove button)
   * @default false
   */
  readOnly?: boolean;

  /**
   * Whether to enable expand functionality (click to view full-size)
   * @default true
   */
  enableExpand?: boolean;
}

/**
 * File preview component with type-appropriate rendering.
 * 
 * Automatically detects file type from URL and renders:
 * - **Images**: `<img>` with object-cover
 * - **Videos**: `<video>` with optional controls
 * - **PDFs**: Icon with file name
 * - **Unknown**: Generic file icon
 * 
 * @example
 * ```tsx
 * // Basic image preview
 * <FilePreview
 *   src={imageUrl}
 *   onRemove={() => setImageUrl(null)}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Video preview with custom height
 * <FilePreview
 *   src={videoUrl}
 *   previewHeight="h-64"
 *   showVideoControls={true}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Read-only PDF preview
 * <FilePreview
 *   src={pdfUrl}
 *   fileName="report.pdf"
 *   readOnly
 * />
 * ```
 */
export const FilePreview = memo(function FilePreview({
  src,
  fileType: explicitFileType,
  alt = "Uploaded file",
  fileName,
  onRemove,
  className,
  previewHeight = "h-32",
  rounded = "lg",
  showVideoControls = false,
  readOnly = false,
  enableExpand = true,
}: FilePreviewProps) {
  // Auto-detect file type if not explicitly provided
  const fileType = useMemo(
    () => explicitFileType || detectFileType(src),
    [explicitFileType, src]
  );

  const roundedClass = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
  }[rounded];

  // Determine if file type supports expansion
  const canExpand = enableExpand && (fileType === "image" || fileType === "video");

  // Render appropriate preview based on file type
  const renderPreview = () => {
    // Wrap expandable media types with ExpandableMedia component
    if (canExpand) {
      const mediaType = fileType as MediaType;
      
      return (
        <ExpandableMedia
          src={src}
          mediaType={mediaType}
          alt={alt}
          fileName={fileName}
          showVideoControls={showVideoControls}
          className={cn("w-full", previewHeight)}
        >
          {fileType === "image" ? (
            <div className="relative w-full h-full">
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={src.includes('blob:') || src.startsWith('data:')}
              />
            </div>
          ) : (
            <div className="relative w-full h-full">
              <video
                src={src}
                controls={showVideoControls}
                className="h-full w-full object-contain"
                preload="metadata"
              />
            </div>
          )}
        </ExpandableMedia>
      );
    }

    // Non-expandable media types (PDF, unknown)
    switch (fileType) {
      case "image":
        return (
          <div className={cn("relative w-full", previewHeight)}>
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized={src.includes('blob:') || src.startsWith('data:')}
            />
          </div>
        );

      case "video":
        return (
          <div className={cn("relative w-full", previewHeight)}>
            <video
              src={src}
              controls={showVideoControls}
              className="h-full w-full object-contain"
              preload="metadata"
            />
            {!showVideoControls && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Play className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
            )}
          </div>
        );

      case "pdf":
        return (
          <div
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2",
              "bg-gray-100 dark:bg-(--color-bg-secondary)",
              previewHeight
            )}
          >
            <FileText className="h-10 w-10 text-red-500" />
            <span className="text-xs text-gray-600 dark:text-(--color-text-3) truncate max-w-[90%] px-2">
              {fileName || "PDF Document"}
            </span>
          </div>
        );

      default:
        return (
          <div
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2",
              "bg-gray-100 dark:bg-(--color-bg-secondary)",
              previewHeight
            )}
          >
            <File className="h-10 w-10 text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-(--color-text-3) truncate max-w-[90%] px-2">
              {fileName || "File"}
            </span>
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "relative group overflow-hidden",
        roundedClass,
        "border border-gray-200 bg-gray-50/50",
        "dark:border-(--color-border-container) dark:bg-(--color-bg-primary)/50",
        className
      )}
    >
      {renderPreview()}

      {/* Remove button - only show if not read-only and callback provided */}
      {!readOnly && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            "absolute right-2 top-2",
            "rounded-full bg-black/50 p-1.5",
            "text-white opacity-0 backdrop-blur-sm",
            "transition-opacity hover:bg-black/70",
            "group-hover:opacity-100",
            "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
          )}
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

/**
 * Icon component for file type display
 * Returns appropriate icon based on file type
 */
export function FileTypeIcon({ 
  type, 
  className 
}: { 
  type: FileType; 
  className?: string 
}) {
  const iconClass = cn("h-6 w-6", className);
  
  switch (type) {
    case "image":
      return <ImageIcon className={iconClass} />;
    case "video":
      return <Play className={iconClass} />;
    case "pdf":
      return <FileText className={iconClass} />;
    default:
      return <File className={iconClass} />;
  }
}

