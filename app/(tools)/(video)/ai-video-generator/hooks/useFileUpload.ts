"use client";

/**
 * useFileUpload Hook
 * Shared upload logic for all file upload components
 * 
 * Reasoning: Extracts common upload state management and callbacks
 * to avoid duplication between different upload components and file types
 */

import { useState, useCallback } from "react";
import { useGenerationStore } from "../store/useGenerationStore";
import type { AcceptedFileType } from "@/app/components/common/file-upload";

interface UploadResponse {
  ufsUrl?: string;
  url?: string;
  name: string;
  size: number;
}

interface UseFileUploadOptions {
  /** Field name to store the uploaded file URL in the store */
  fieldName: string;
  /** Optional field name to store the file name */
  fileNameField?: string;
  /** Type of file being uploaded (for validation/logging) */
  fileType?: AcceptedFileType;
  /** Callback when upload completes successfully */
  onUploadComplete?: (url: string, response?: UploadResponse) => void;
  /** Callback when upload fails */
  onUploadError?: (error: Error) => void;
  /** Callback when upload begins */
  onUploadBegin?: () => void;
}

interface UseFileUploadReturn {
  /** Current uploading state */
  isUploading: boolean;
  /** Handler for upload begin event */
  handleUploadBegin: () => void;
  /** Handler for upload complete event */
  handleUploadComplete: (res: UploadResponse[]) => void;
  /** Handler for upload error event */
  handleUploadError: (error: Error) => void;
  /** Handler to remove uploaded file */
  handleRemove: () => void;
  /** Update field in store directly */
  updateField: (field: string, value: unknown) => void;
}

/**
 * Custom hook for managing file upload state and callbacks
 * Compatible with UploadThing components (UploadButton, UploadDropzone)
 * 
 * Supports all file types: images, videos, PDFs, and combined uploads
 */
export function useFileUpload({
  fieldName,
  fileNameField,
  fileType = "all",
  onUploadComplete,
  onUploadError,
  onUploadBegin,
}: UseFileUploadOptions): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const updateField = useGenerationStore((s) => s.updateField);

  // Handle upload start
  const handleUploadBegin = useCallback(() => {
    setIsUploading(true);
    onUploadBegin?.();
  }, [onUploadBegin]);

  // Handle successful upload
  const handleUploadComplete = useCallback(
    (res: UploadResponse[]) => {
      setIsUploading(false);

      // Extract URL from response (supports both ufsUrl and url)
      const uploadedFile = res?.[0];
      const uploadedUrl = uploadedFile?.ufsUrl || uploadedFile?.url;

      if (uploadedUrl) {
        updateField(fieldName, uploadedUrl);
        
        // Optionally store file name in separate field
        if (fileNameField && uploadedFile?.name) {
          updateField(fileNameField, uploadedFile.name);
        }
        
        onUploadComplete?.(uploadedUrl, uploadedFile);
      }
    },
    [fieldName, fileNameField, updateField, onUploadComplete]
  );

  // Handle upload error with graceful fallback
  const handleUploadError = useCallback(
    (error: Error) => {
      setIsUploading(false);
      console.error(`Upload failed (${fileType}):`, error);

      if (onUploadError) {
        onUploadError(error);
      } else {
        // Default error handling
        alert(`Upload failed: ${error.message}`);
      }
    },
    [fileType, onUploadError]
  );

  // Handle file removal
  const handleRemove = useCallback(() => {
    updateField(fieldName, null);
    
    // Also clear file name field if it was set
    if (fileNameField) {
      updateField(fileNameField, null);
    }
  }, [fieldName, fileNameField, updateField]);

  return {
    isUploading,
    handleUploadBegin,
    handleUploadComplete,
    handleUploadError,
    handleRemove,
    updateField,
  };
}

// Alias for semantic clarity when working with images
export { useFileUpload as useImageUpload };

