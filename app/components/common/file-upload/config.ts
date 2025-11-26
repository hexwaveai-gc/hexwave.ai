import { ImageIcon, Video, FileText, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcceptedFileType, FileTypeConfig } from "./types";

/**
 * Configuration mapping for each file type
 * Maps file types to their upload endpoints, icons, and default labels
 */
export const FILE_TYPE_CONFIG: Record<AcceptedFileType, FileTypeConfig> = {
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

/**
 * Creates shared appearance styles for upload components
 * @param accentColor - Optional custom accent color
 */
export const createSharedAppearance = (accentColor?: string) => ({
  button: cn(
    accentColor 
      ? `!bg-[${accentColor}] hover:!bg-[${accentColor}]/90 ut-uploading:!bg-[${accentColor}]/70`
      : "!bg-[var(--color-theme-2)] hover:!bg-[var(--color-theme-2)]/90 ut-uploading:!bg-[var(--color-theme-2)]/70",
    "!text-black text-sm font-medium",
    "px-4 py-2 rounded-lg"
  ),
  allowedContent: "text-xs text-gray-500 dark:text-[var(--color-text-3)] mt-2",
});

