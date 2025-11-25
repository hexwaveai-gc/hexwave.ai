/**
 * File Upload Components
 * 
 * A unified file upload system supporting images, videos, PDFs
 * with single and multi-file upload capabilities.
 * 
 * @example
 * ```tsx
 * import { FileUploader, FilePreview } from "@/app/components/common/file-upload";
 * 
 * // Single image upload
 * <FileUploader accept="image" value={url} onChange={setUrl} />
 * 
 * // Multiple files
 * <FileUploader accept="image" maxFiles={4} value={urls} onChange={setUrls} />
 * 
 * // Standalone preview
 * <FilePreview src={url} onRemove={() => setUrl(null)} />
 * ```
 * 
 * @see README.md for full documentation
 */

// Main components
export { 
  FileUploader, 
  type FileUploaderProps, 
  type AcceptedFileType 
} from "./FileUploader";

export { 
  FilePreview, 
  FileTypeIcon, 
  detectFileType, 
  type FilePreviewProps, 
  type FileType 
} from "./FilePreview";

export {
  ExpandableMedia,
  type ExpandableMediaProps,
  type MediaType
} from "./ExpandableMedia";
