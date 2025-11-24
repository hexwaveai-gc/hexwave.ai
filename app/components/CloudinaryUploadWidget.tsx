"use client";

import { CldUploadWidget, type CloudinaryUploadWidgetResults, type CloudinaryUploadWidgetError } from "next-cloudinary";
import { Button } from "@/app/components/ui/button";
import { Upload } from "lucide-react";
import { ReactNode } from "react";

/**
 * CloudinaryUploadWidget Component
 * 
 * A reusable component for uploading files to Cloudinary using the upload widget.
 * Supports signed uploads via the /api/cloudinary/signature endpoint.
 * 
 * @example
 * ```tsx
 * // Basic usage with default button
 * <CloudinaryUploadWidget
 *   onUploadSuccess={(result) => {
 *     console.log("Upload successful:", result.info);
 *   }}
 * />
 * 
 * // Custom trigger with upload preset
 * <CloudinaryUploadWidget
 *   uploadPreset="my_preset"
 *   onUploadSuccess={(result) => {
 *     const { secure_url, public_id } = result.info;
 *     console.log("Image URL:", secure_url);
 *   }}
 * >
 *   <Button variant="outline">Upload Image</Button>
 * </CloudinaryUploadWidget>
 * 
 * // With custom options
 * <CloudinaryUploadWidget
 *   options={{
 *     sources: ["local", "url", "camera"],
 *     multiple: false,
 *     maxFiles: 1,
 *     resourceType: "image",
 *     clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
 *     maxFileSize: 10000000, // 10MB
 *   }}
 *   onUploadSuccess={(result) => {
 *     console.log("Upload complete:", result.info);
 *   }}
 *   onUploadError={(error) => {
 *     console.error("Upload failed:", error);
 *   }}
 * />
 * ```
 */

interface CloudinaryUploadWidgetOptions {
  sources?: ("local" | "url" | "camera" | "image_search" | "google_drive" | "dropbox" | "facebook" | "instagram")[];
  multiple?: boolean;
  maxFiles?: number;
  resourceType?: "image" | "video" | "raw" | "auto";
  clientAllowedFormats?: string[];
  maxFileSize?: number;
  maxImageWidth?: number;
  maxImageHeight?: number;
  minImageWidth?: number;
  minImageHeight?: number;
  cropping?: boolean;
  croppingAspectRatio?: number;
  folder?: string;
  tags?: string[];
  context?: Record<string, string>;
  [key: string]: any;
}

interface CloudinaryUploadWidgetProps {
  /** Callback function called when upload succeeds */
  onUploadSuccess?: (result: CloudinaryUploadWidgetResults) => void;
  /** Callback function called when upload fails */
  onUploadError?: (error: CloudinaryUploadWidgetError) => void;
  /** Optional upload preset name (if not using signed uploads) */
  uploadPreset?: string;
  /** Custom options for the Cloudinary upload widget */
  options?: CloudinaryUploadWidgetOptions;
  /** Custom trigger element. If not provided, a default button is rendered */
  children?: ReactNode;
}

// Reasoning: Create a reusable component that encapsulates Cloudinary upload logic
// Uses composition pattern to allow custom trigger elements via children prop
export function CloudinaryUploadWidget({
  onUploadSuccess,
  onUploadError,
  uploadPreset,
  options = {},
  children,
}: CloudinaryUploadWidgetProps) {
  // Reasoning: Merge default options with user-provided options
  // Default to local source and image resource type for common use cases
  const defaultOptions: CloudinaryUploadWidgetOptions = {
    sources: ["local", "url", "camera"],
    multiple: false,
    maxFiles: 1,
    resourceType: "auto",
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  // Reasoning: Handle upload success with try-catch for graceful error handling
  const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    try {
      if (result.event === "success") {
        onUploadSuccess?.(result);
      }
    } catch (error) {
      console.error("[CloudinaryUploadWidget] Error in onUploadSuccess callback:", error);
    }
  };

  // Reasoning: Handle upload errors gracefully
  const handleUploadError = (error: CloudinaryUploadWidgetError) => {
    try {
      console.error("[CloudinaryUploadWidget] Upload error:", error);
      onUploadError?.(error);
    } catch (err) {
      console.error("[CloudinaryUploadWidget] Error in onUploadError callback:", err);
    }
  };

  return (
    <CldUploadWidget
      signatureEndpoint="/api/cloudinary/signature"
      uploadPreset={uploadPreset}
      options={mergedOptions}
      onSuccess={handleUploadSuccess}
      onError={handleUploadError}
    >
      {({ open }) => {
        // Reasoning: Allow custom trigger via children prop for flexibility
        // Provide sensible default button if no children provided
        if (children) {
          return (
            <div onClick={() => open()} role="button" tabIndex={0} onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
              }
            }}>
              {children}
            </div>
          );
        }

        return (
          <Button
            type="button"
            variant="outline"
            onClick={() => open()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
        );
      }}
    </CldUploadWidget>
  );
}

