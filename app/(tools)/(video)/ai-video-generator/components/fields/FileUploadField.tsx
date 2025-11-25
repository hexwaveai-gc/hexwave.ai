"use client";

/**
 * File Upload Field Component
 * Generic form field wrapper for file uploads with label and error handling
 * 
 * Supports:
 * - Single file upload (maxFiles=1)
 * - Multiple file upload (maxFiles>1)
 * - Images, Videos, PDFs, and all file types via the `accept` prop
 */

import { memo, useCallback } from "react";
import { Label } from "@/app/components/ui/label";
import { 
  FileUploader, 
  type AcceptedFileType,
  type FileUploaderProps 
} from "@/app/components/common/file-upload";
import { useGenerationStore } from "../../store/useGenerationStore";
import { useFieldError, useFieldValue } from "../../store/selectors";

interface FileUploadFieldProps {
  /** Field name in the store */
  fieldName: string;
  /** Accept type - image, video, pdf, or all */
  accept?: AcceptedFileType;
  /** Maximum number of files (1 = single, >1 = multiple) */
  maxFiles?: number;
  /** Custom label text */
  label?: string;
  /** Help text shown below the uploader */
  helpText?: string;
  /** Upload variant - button or dropzone */
  variant?: FileUploaderProps["variant"];
  /** Custom button label */
  buttonLabel?: string;
  /** Custom dropzone label */
  dropzoneLabel?: string;
  /** Custom allowed content text */
  allowedContent?: string;
  /** Preview height */
  previewHeight?: string;
  /** Grid columns for multi-file preview */
  previewColumns?: 2 | 3 | 4;
}

/**
 * Formats a camelCase field name into a readable label
 */
function formatFieldLabel(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

/**
 * Generic file upload field for forms
 * Wraps FileUploader with form integration (labels, errors, store binding)
 */
export const FileUploadField = memo(function FileUploadField({
  fieldName,
  accept = "image",
  maxFiles = 1,
  label,
  helpText,
  variant = "button",
  buttonLabel,
  dropzoneLabel,
  allowedContent,
  previewHeight,
  previewColumns,
}: FileUploadFieldProps) {
  const value = useFieldValue(fieldName) as string | string[] | null;
  const error = useFieldError(fieldName);
  const updateField = useGenerationStore((s) => s.updateField);

  // Handle file change (upload or remove)
  const handleChange = useCallback(
    (newValue: string | string[] | null) => {
      updateField(fieldName, newValue);
    },
    [fieldName, updateField]
  );

  const displayLabel = label || formatFieldLabel(fieldName);

  return (
    <div className="space-y-2 md:space-y-3">
      <Label className="text-xs md:text-sm font-medium text-gray-900 dark:text-(--color-text-1)">
        {displayLabel}
      </Label>

      <FileUploader
        accept={accept}
        maxFiles={maxFiles}
        variant={variant}
        value={value}
        onChange={handleChange}
        hasError={!!error}
        buttonLabel={buttonLabel}
        dropzoneLabel={dropzoneLabel}
        allowedContent={allowedContent}
        previewHeight={previewHeight}
        previewColumns={previewColumns}
        showVideoControls={false}
      />

      {helpText && !error && (
        <p className="text-[10px] md:text-xs text-gray-500 dark:text-(--color-text-3)">
          {helpText}
        </p>
      )}

      {error && (
        <p className="text-[10px] md:text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

// Convenience components for specific file types

export const ImageUploadField = memo(function ImageUploadField(
  props: Omit<FileUploadFieldProps, "accept">
) {
  return <FileUploadField {...props} accept="image" />;
});

export const VideoUploadField = memo(function VideoUploadField(
  props: Omit<FileUploadFieldProps, "accept">
) {
  return <FileUploadField {...props} accept="video" />;
});

export const PdfUploadField = memo(function PdfUploadField(
  props: Omit<FileUploadFieldProps, "accept">
) {
  return <FileUploadField {...props} accept="pdf" />;
});

// Multi-file convenience components

export const MultiImageUploadField = memo(function MultiImageUploadField(
  props: Omit<FileUploadFieldProps, "accept" | "maxFiles"> & { maxFiles?: number }
) {
  return <FileUploadField {...props} accept="image" maxFiles={props.maxFiles || 4} />;
});

export const MultiVideoUploadField = memo(function MultiVideoUploadField(
  props: Omit<FileUploadFieldProps, "accept" | "maxFiles"> & { maxFiles?: number }
) {
  return <FileUploadField {...props} accept="video" maxFiles={props.maxFiles || 3} />;
});

export const MultiPdfUploadField = memo(function MultiPdfUploadField(
  props: Omit<FileUploadFieldProps, "accept" | "maxFiles"> & { maxFiles?: number }
) {
  return <FileUploadField {...props} accept="pdf" maxFiles={props.maxFiles || 5} />;
});
