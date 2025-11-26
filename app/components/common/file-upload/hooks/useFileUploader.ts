import { useState, useCallback, useMemo } from "react";
import type { AcceptedFileType, UploadResponse, UploadedFile } from "../types";
import { FILE_TYPE_CONFIG, createSharedAppearance } from "../config";
import { detectFileType, type FileType } from "../FilePreview";

interface UseFileUploaderOptions {
  accept: AcceptedFileType;
  maxFiles: number;
  value?: string | string[] | null;
  fileNames?: string | string[];
  onChange?: (value: string | string[] | null, fileNames?: string | string[]) => void;
  onUploadComplete?: (url: string, response: UploadResponse) => void;
  onUploadError?: (error: Error) => void;
  onUploadBegin?: () => void;
  buttonLabel?: string;
  dropzoneLabel?: string;
  allowedContent?: string;
  accentColor?: string;
}

export function useFileUploader({
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
}: UseFileUploaderOptions) {
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
    return [{ url: value, name: typeof fileNames === "string" ? fileNames : undefined }];
  }, [value, fileNames]);

  // Get configuration for the selected file type
  const config = useMemo(() => FILE_TYPE_CONFIG[accept], [accept]);

  // Select appropriate endpoint based on single/multi mode
  const endpoint = useMemo(
    () => (isMultiMode ? config.multiEndpoint : config.singleEndpoint),
    [isMultiMode, config]
  );

  // Resolve labels with defaults
  const resolvedButtonLabel = buttonLabel || config.defaultLabel;
  const resolvedDropzoneLabel = dropzoneLabel || config.defaultDropzoneLabel;
  const resolvedAllowedContent =
    allowedContent ||
    (isMultiMode
      ? `${config.defaultAllowedContent} (up to ${maxFiles} files)`
      : config.defaultAllowedContent);

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
        const newFiles = res
          .map((file) => file.ufsUrl || file.url)
          .filter(Boolean) as string[];
        const newNames = res.map((file) => file.name);
        const currentUrls = filesArray.map((f) => f.url);
        const currentNames = filesArray.map((f) => f.name || "");

        const updatedUrls = [...currentUrls, ...newFiles].slice(0, maxFiles);
        const updatedNames = [...currentNames, ...newNames].slice(0, maxFiles);

        onChange?.(updatedUrls, updatedNames);

        // Call onUploadComplete for each new file
        res.forEach((file) => {
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
  const handleRemoveFile = useCallback(
    (index: number) => {
      if (isMultiMode) {
        const newUrls = filesArray.filter((_, i) => i !== index).map((f) => f.url);
        const newNames = filesArray.filter((_, i) => i !== index).map((f) => f.name || "");
        onChange?.(newUrls.length > 0 ? newUrls : null, newNames);
      } else {
        onChange?.(null);
      }
    },
    [isMultiMode, filesArray, onChange]
  );

  // Handle removing all files
  const handleRemoveAll = useCallback(() => {
    onChange?.(isMultiMode ? [] : null);
  }, [isMultiMode, onChange]);

  // Detect file type for preview
  const getFileType = useCallback(
    (url: string): FileType => {
      if (accept !== "all") return accept;
      return detectFileType(url);
    },
    [accept]
  );

  return {
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
  };
}

