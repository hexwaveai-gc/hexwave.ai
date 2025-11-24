"use client";

import { useMemo, useEffect } from "react";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Upload, X } from "lucide-react";
import ModelSelectorDialog from "./ModelSelectorDialog";
import AdvancedSettingsDialog from "./AdvancedSettingsDialog";
import PrimaryFieldsRenderer, { getPrimaryFieldNames } from "./PrimaryFieldsRenderer";
import { useImageGenerationStore } from "../store/useImageGenerationStore";
import { useFieldValue, useIsFormValid } from "../store/selectors";

/**
 * Restyle input form for transforming existing images
 * Core fields: original image upload, style prompt, model selector
 * Dynamic fields: based on selected model's settings
 * 
 * Refactored to use Zustand store - eliminates prop drilling
 */
export default function RestyleInputs() {
  // Get state from store
  const selectedModel = useImageGenerationStore((s) => s.selectedModel);
  const selectedModelId = useImageGenerationStore((s) => s.selectedModelId);
  const stylePrompt = useFieldValue<string>("style_prompt", "");
  const originalImage = useFieldValue<File | null>("original_image", null);
  const updateField = useImageGenerationStore((s) => s.updateField);
  const startGeneration = useImageGenerationStore((s) => s.startGeneration);
  const isFormValid = useIsFormValid();

  // Ensure we have a valid File object
  const validOriginalImage = useMemo(() => {
    if (!originalImage) return null;
    if (originalImage instanceof File) return originalImage;
    // If it's not a File, clear it
    console.warn("original_image is not a valid File object, clearing it");
    return null;
  }, [originalImage]);

  // Generate object URL for preview
  const imageUrl = useMemo(() => {
    if (!validOriginalImage) return null;
    try {
      return URL.createObjectURL(validOriginalImage);
    } catch (error) {
      console.error("Failed to create object URL:", error);
      return null;
    }
  }, [validOriginalImage]);

  // Cleanup object URL on unmount or when image changes
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Clear invalid image on mount if needed
  useEffect(() => {
    if (originalImage && !(originalImage instanceof File)) {
      updateField("original_image", null);
    }
  }, [originalImage, updateField]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file instanceof File) {
      updateField("original_image", file);
    }
  };

  const handleRemoveImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    updateField("original_image", null);
  };

  const handleGenerate = async () => {
    try {
      await startGeneration();
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  // Fields to exclude from Advanced Dialog
  const excludedFields = [
    "prompt", // not used here but good to exclude if present
    "reference_images",
    "style_prompt",
    "original_image",
    ...getPrimaryFieldNames(), // Exclude all primary fields
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-page-padding)] py-[var(--spacing-element-gap)]">
        <div className="space-y-6">
          {/* Original Image Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
              Original Image <span className="text-red-500">*</span>
            </Label>

            {!validOriginalImage ? (
              <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center transition-colors hover:border-gray-300 hover:bg-gray-100 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:hover:border-[var(--color-border-component)] dark:hover:bg-[var(--color-bg-secondary)]">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="original-image-upload"
                />
                <label
                  htmlFor="original-image-upload"
                  className="flex cursor-pointer flex-col items-center"
                >
                  <Upload className="mb-2 h-10 w-10 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-[var(--color-text-2)]">
                  Upload Image
                </span>
                <span className="mt-1 text-xs text-gray-500 dark:text-[var(--color-text-3)]">
                    PNG, JPG, WebP up to 10MB
                  </span>
                </label>
              </div>
            ) : imageUrl ? (
              <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-[var(--color-border-container)]">
                <img
                  src={imageUrl}
                  alt="Original"
                  className="max-h-[300px] w-full object-contain bg-gray-50 dark:bg-[var(--color-bg-page)]"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Style Prompt */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
              Style Prompt
            </Label>
            <Textarea
              value={stylePrompt}
              onChange={(e) => updateField("style_prompt", e.target.value)}
              placeholder="Describe the style you want to apply..."
              className="min-h-[180px] w-full resize-none rounded-lg border-gray-200 bg-gray-50 p-4 text-base focus:border-blue-500 focus:ring-0 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)] dark:placeholder:text-[var(--color-text-3)]"
            />
          </div>
        </div>
      </div>

      {/* Sticky Footer - Always at bottom */}
      <div className="mt-auto bg-white px-[var(--spacing-page-padding)] py-[var(--spacing-footer-padding)] dark:bg-[var(--color-bg-primary)]">
        {/* Model Selection */}
        <div className="mb-4">
          <Label className="mb-2 block text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
            Model
          </Label>
          <ModelSelectorDialog />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left Side - Controls */}
          <div className="flex items-center gap-3">
            {/* Primary Fields - Dynamically rendered based on model settings */}
            <PrimaryFieldsRenderer />

            {/* Advanced Settings */}
            <AdvancedSettingsDialog excludeFields={excludedFields} />
          </div>

          {/* Right Side - Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!isFormValid || !selectedModelId}
            variant="generate"
            className="h-10 min-w-[140px] rounded-lg px-8"
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}
