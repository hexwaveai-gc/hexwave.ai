"use client";

/**
 * Image Upload Area Component
 * Drag and drop area for uploading images for Image-to-Video generation
 * 
 * Reasoning: Uses the unified FileUploader component with dropzone variant
 * for a prominent upload area with drag-and-drop support
 */

import { useCallback } from "react";
import { FileUploader } from "@/app/components/common/file-upload";
import { useGenerationStore } from "../../store/useGenerationStore";

interface ImageUploadAreaProps {
  /** Field name to store the uploaded image URL */
  fieldName?: string;
  /** Callback when upload completes */
  onUploadComplete?: (url: string) => void;
}

export function ImageUploadArea({
  fieldName = "imageBase64",
  onUploadComplete,
}: ImageUploadAreaProps) {
  const updateField = useGenerationStore((s) => s.updateField);
  const fieldValues = useGenerationStore((s) => s.fieldValues);
  const currentImage = fieldValues[fieldName] as string | undefined;

  // Handle image change (upload or remove)
  // Note: For single file mode, value is string | null (not array)
  const handleChange = useCallback(
    (value: string | string[] | null) => {
      // Extract single URL for single-file mode
      const url = Array.isArray(value) ? value[0] || null : value;
      updateField(fieldName, url);
      if (url) {
        onUploadComplete?.(url);
      }
    },
    [fieldName, updateField, onUploadComplete]
  );

  return (
    <FileUploader
      accept="image"
      variant="dropzone"
      value={currentImage || null}
      onChange={handleChange}
      onUploadComplete={onUploadComplete}
      previewHeight="h-48"
    />
  );
}
