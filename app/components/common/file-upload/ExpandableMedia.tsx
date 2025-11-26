"use client";

/**
 * ExpandableMedia Component
 * Displays media with expand icon on hover and opens full-size view in dialog
 * 
 * Features:
 * - Hover to show expand icon
 * - Click to open full-size media in dialog
 * - Uses Next.js Image for optimized loading
 * - Keyboard accessible
 * - Dark mode support
 */

import { memo, useState, useCallback } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/app/components/ui/dialog";

export type MediaType = "image" | "video";

export interface ExpandableMediaProps {
  /**
   * Media source URL (required)
   */
  src: string;

  /**
   * Type of media to display
   */
  mediaType: MediaType;

  /**
   * Alt text for accessibility (images only)
   * @default "Media preview"
   */
  alt?: string;

  /**
   * File name for dialog title
   * @default "Media"
   */
  fileName?: string;

  /**
   * Additional CSS classes for the container
   */
  className?: string;

  /**
   * Children to render inside the expandable container
   * If not provided, renders default media element
   */
  children?: React.ReactNode;

  /**
   * Whether to show video controls
   * @default true
   */
  showVideoControls?: boolean;
}

/**
 * Wraps media content with expand functionality.
 * Shows expand icon on hover and opens full-size view in dialog when clicked.
 * 
 * @example
 * ```tsx
 * // Basic usage with image
 * <ExpandableMedia src={imageUrl} mediaType="image" />
 * ```
 * 
 * @example
 * ```tsx
 * // With custom children (custom preview)
 * <ExpandableMedia src={videoUrl} mediaType="video" fileName="intro.mp4">
 *   <video src={videoUrl} className="w-full h-full object-cover" />
 * </ExpandableMedia>
 * ```
 */
export const ExpandableMedia = memo(function ExpandableMedia({
  src,
  mediaType,
  alt = "Media preview",
  fileName = "Media",
  className,
  children,
  showVideoControls = true,
}: ExpandableMediaProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Check if source is a blob or data URL (can't be optimized)
  const isUnoptimizable = src.includes('blob:') || src.startsWith('data:');

  // Render default media element if children not provided
  const renderMediaPreview = () => {
    if (children) return children;

    if (mediaType === "image") {
      return (
        <div className="relative w-full h-full">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={isUnoptimizable}
          />
        </div>
      );
    }

    return (
      <video
        src={src}
        controls={showVideoControls}
        className="w-full h-full object-contain"
        preload="metadata"
      />
    );
  };

  // Render full-size media in dialog (use regular img for full quality)
  const renderFullSizeMedia = () => {
    if (mediaType === "image") {
      return (
        // Using regular img for dialog to show original full-size image
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[90vh] object-contain"
        />
      );
    }

    return (
      <video
        src={src}
        controls
        autoPlay
        className="w-full h-auto max-h-[90vh]"
        preload="metadata"
      />
    );
  };

  return (
    <>
      {/* Expandable Preview Container */}
      <div
        className={cn(
          "relative group cursor-pointer",
          className
        )}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Expand ${fileName}`}
      >
        {renderMediaPreview()}

        {/* Expand Icon - Shows on hover */}
        <div
          className={cn(
            "absolute inset-0",
            "flex items-center justify-center",
            "bg-black/0 group-hover:bg-black/40",
            "transition-all duration-200",
            "opacity-0 group-hover:opacity-100"
          )}
        >
          <div
            className={cn(
              "rounded-full bg-white/90 dark:bg-black/90 p-3",
              "backdrop-blur-sm",
              "transform scale-75 group-hover:scale-100",
              "transition-transform duration-200"
            )}
          >
            <Expand className="h-5 w-5 text-black dark:text-white" />
          </div>
        </div>
      </div>

      {/* Full-Size Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn(
            "w-fit max-w-[96vw] max-h-[96vh]",
            "p-0 gap-0 overflow-hidden",
            "bg-black/95 border-0 shadow-2xl",
            // Override close button focus ring styles
            "[&>button]:focus:ring-0 [&>button]:focus:ring-offset-0",
            "[&>button]:text-white/80 [&>button]:hover:text-white [&>button]:hover:bg-white/10"
          )}
        >
          {/* Visually hidden title for accessibility */}
          <DialogTitle className="sr-only">
            Full size view of {fileName}
          </DialogTitle>
          
          {renderFullSizeMedia()}
          
          {/* Optional: File name overlay */}
          {fileName && fileName !== "Media" && (
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0",
                "bg-linear-to-t from-black/80 to-transparent",
                "px-4 py-2"
              )}
            >
              <p className="text-xs text-white font-medium truncate">
                {fileName}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});

