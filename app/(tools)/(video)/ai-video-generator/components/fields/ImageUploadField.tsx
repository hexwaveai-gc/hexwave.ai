"use client";

/**
 * Image Upload Field Component
 * Handles single image uploads with preview
 * Used for: imageBase64, endFrameImageBase64
 */

import { memo, useCallback, useRef, useState } from "react";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Upload, X } from "lucide-react";
import { useGenerationStore } from "../../store/useGenerationStore";
import { useFieldError, useFieldValue } from "../../store/selectors";

interface ImageUploadFieldProps {
  fieldName: string;
  label?: string;
  helpText?: string;
}

/**
 * Convert file to base64
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ImageUploadField = memo(function ImageUploadField({
  fieldName,
  label,
  helpText,
}: ImageUploadFieldProps) {
  const value = useFieldValue(fieldName);
  const error = useFieldError(fieldName);
  const updateField = useGenerationStore((s) => s.updateField);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be under 10MB");
        return;
      }
      
      setIsUploading(true);
      try {
        const base64 = await fileToBase64(file);
        updateField(fieldName, base64);
      } catch (err) {
        console.error("Failed to upload image:", err);
        alert("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    },
    [fieldName, updateField]
  );
  
  const handleRemove = useCallback(() => {
    updateField(fieldName, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [fieldName, updateField]);
  
  const displayLabel = label || 
    fieldName
      .replace(/([A-Z])/g, " $1")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-900 dark:text-(--color-text-1)">
        {displayLabel}
      </Label>
      
      {!value ? (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`${fieldName}-upload`}
            disabled={isUploading}
          />
          <label
            htmlFor={`${fieldName}-upload`}
            className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              error
                ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 dark:border-(--color-border-container) dark:bg-(--color-bg-primary) dark:hover:border-(--color-border-component) dark:hover:bg-(--color-bg-secondary)"
            }`}
          >
            <Upload className="h-8 w-8 text-gray-400 dark:text-(--color-text-3)" />
            <span className="mt-2 text-sm text-gray-600 dark:text-(--color-text-2)">
              {isUploading ? "Uploading..." : "Click to upload image"}
            </span>
            <span className="mt-1 text-xs text-gray-500 dark:text-(--color-text-3)">
              PNG, JPG up to 10MB
            </span>
          </label>
        </div>
      ) : (
        <div className="relative group">
          <img
            src={value as string}
            alt="Uploaded"
            className="h-32 w-full rounded-lg object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {helpText && !error && (
        <p className="text-xs text-gray-500 dark:text-(--color-text-3)">
          {helpText}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

