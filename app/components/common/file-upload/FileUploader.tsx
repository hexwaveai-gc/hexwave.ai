"use client";

/**
 * FileUploader Component
 * Unified upload component supporting images, videos, PDFs, and all file types
 * 
 * @see README.md for documentation
 */

import { memo } from "react";
import { FilePreview } from "./FilePreview";
import { useFileUploader } from "./hooks";
import { 
  MultiFilePreview,
  ButtonUploader,
  DropzoneUploader,
} from "./components";

// Re-export types for external use
export type { FileUploaderProps, AcceptedFileType } from "./types";
import type { FileUploaderProps } from "./types";

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
  className,
  previewHeight = "h-32",
  showPreview = true,
  accentColor,
  icon: CustomIcon,
  readOnlyPreview = false,
  showVideoControls = true,
  previewColumns = 3,
}: FileUploaderProps) {
  const {
    // State
    isUploading,
    uploadProgress,
    setUploadProgress,
    isMultiMode,
    filesArray,
    canUploadMore,
    
    // Config
    config,
    endpoint,
    sharedAppearance,
    
    // Resolved labels
    resolvedButtonLabel,
    resolvedDropzoneLabel,
    resolvedAllowedContent,
    
    // Handlers
    handleUploadBegin,
    handleUploadComplete,
    handleUploadError,
    handleRemoveFile,
    handleRemoveAll,
    getFileType,
  } = useFileUploader({
    accept,
    maxFiles,
    value,
    fileNames,
    onChange,
    onUploadComplete,
    onUploadError,
    onUploadBegin,
    buttonLabel,
    dropzoneLabel,
    allowedContent,
    accentColor,
  });

  const IconComponent = CustomIcon || config.icon;

  // Render multi-file preview grid
  if (isMultiMode && filesArray.length > 0 && showPreview) {
    return (
      <MultiFilePreview
        filesArray={filesArray}
        maxFiles={maxFiles}
                previewHeight={previewHeight}
        previewColumns={previewColumns}
                showVideoControls={showVideoControls}
        readOnlyPreview={readOnlyPreview}
        disabled={disabled}
        canUploadMore={canUploadMore}
                endpoint={endpoint}
        className={className}
        getFileType={getFileType}
        onRemoveFile={handleRemoveFile}
        onRemoveAll={handleRemoveAll}
                onUploadBegin={handleUploadBegin}
        onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
      />
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
      <ButtonUploader
          endpoint={endpoint}
          disabled={disabled}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        previewHeight={previewHeight}
        resolvedButtonLabel={resolvedButtonLabel}
        resolvedAllowedContent={resolvedAllowedContent}
        IconComponent={IconComponent}
        className={className}
        sharedAppearance={sharedAppearance}
          onUploadBegin={handleUploadBegin}
        onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          onUploadProgress={setUploadProgress}
      />
    );
  }

  // Render dropzone variant (empty state)
  return (
    <DropzoneUploader
      endpoint={endpoint}
      disabled={disabled}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      resolvedDropzoneLabel={resolvedDropzoneLabel}
      resolvedAllowedContent={resolvedAllowedContent}
      IconComponent={IconComponent}
      className={className}
      sharedAppearance={sharedAppearance}
      onUploadBegin={handleUploadBegin}
      onUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      onUploadProgress={setUploadProgress}
    />
  );
});
