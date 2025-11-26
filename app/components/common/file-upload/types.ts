import type { LucideIcon } from "lucide-react";
import type { FileRouteEndpoint } from "@/app/api/uploadthing/core";

/**
 * Accepted file type for upload
 */
export type AcceptedFileType = "image" | "video" | "pdf" | "all";

/**
 * Response from upload operation
 */
export interface UploadResponse {
  ufsUrl?: string;
  url?: string;
  name: string;
  size: number;
}

/**
 * Represents an uploaded file with URL and optional name
 */
export interface UploadedFile {
  url: string;
  name?: string;
}

/**
 * Configuration for each file type (single vs multi endpoints)
 */
export interface FileTypeConfig {
  singleEndpoint: FileRouteEndpoint;
  multiEndpoint: FileRouteEndpoint;
  icon: LucideIcon;
  defaultLabel: string;
  defaultDropzoneLabel: string;
  defaultAllowedContent: string;
}

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

