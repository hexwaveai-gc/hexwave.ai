"use client";

import { useMemo, useEffect } from "react";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Upload, X, Plus } from "lucide-react";
import ModelSelectorDialog from "./ModelSelectorDialog";
import AdvancedSettingsDialog from "./AdvancedSettingsDialog";
import PrimaryFieldsRenderer, { getPrimaryFieldNames } from "./PrimaryFieldsRenderer";
import { useImageGenerationStore } from "../store/useImageGenerationStore";
import { useFieldValue, useIsFormValid } from "../store/selectors";

/**
 * Image Reference input form with dynamic model-based fields
 * Core fields: image upload, prompt, model selector
 * Dynamic fields: based on selected model's settings
 * 
 * Refactored to use Zustand store - eliminates prop drilling
 */
export default function ImageReferenceInputs() {
  // Get state from store
  const selectedModel = useImageGenerationStore((s) => s.selectedModel);
  const selectedModelId = useImageGenerationStore((s) => s.selectedModelId);
  const prompt = useFieldValue<string>("prompt", "");
  const referenceImages = useFieldValue<File[]>("reference_images", []);
  const updateField = useImageGenerationStore((s) => s.updateField);
  const startGeneration = useImageGenerationStore((s) => s.startGeneration);
  const isFormValid = useIsFormValid();

  const settings = selectedModel?.settings || {};
  const maxFiles = settings.reference_images?.max_files || 3;

  // Filter out invalid file objects and ensure we only have File instances
  const validReferenceImages = useMemo(() => {
    return (referenceImages || []).filter(
      (file): file is File => file instanceof File
    );
  }, [referenceImages]);

  // Generate object URLs for preview
  const imageUrls = useMemo(() => {
    return validReferenceImages.map((file) => {
      try {
        return URL.createObjectURL(file);
      } catch (error) {
        console.error("Failed to create object URL:", error);
        return "";
      }
    });
  }, [validReferenceImages]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxFiles - validReferenceImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    updateField("reference_images", [...validReferenceImages, ...filesToAdd]);
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the object URL before removing
    if (imageUrls[index]) {
      URL.revokeObjectURL(imageUrls[index]);
    }
    const newImages = validReferenceImages.filter((_, i) => i !== index);
    updateField("reference_images", newImages);
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
    "prompt",
    "reference_images",
    ...getPrimaryFieldNames(), // Exclude all primary fields
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-page-padding)] py-[var(--spacing-element-gap)]">
        <div className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
                Reference Images
              </Label>
              <span className="text-xs text-gray-500">
                {validReferenceImages.length}/{maxFiles}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {validReferenceImages.map((file, index) => {
                const imageUrl = imageUrls[index];
                if (!imageUrl) return null;
                
                return (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-[var(--color-border-container)]"
                  >
                    <img
                      src={imageUrl}
                      alt={`Reference ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}

              {validReferenceImages.length < maxFiles && (
                <div className="aspect-square">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={validReferenceImages.length >= maxFiles}
                    className="hidden"
                    id="ref-image-upload"
                  />
                  <label
                    htmlFor="ref-image-upload"
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-3)] dark:hover:border-[var(--color-border-component)] dark:hover:bg-[var(--color-bg-secondary)]"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="mt-1 text-[10px] font-medium">Add</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
              Prompt
            </Label>
            <Textarea
              value={prompt}
              onChange={(e) => updateField("prompt", e.target.value)}
              placeholder="Describe how you want to use the reference images..."
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
        <div className="flex flex-wrap items-center gap-3">
          {/* Left Side - Controls */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
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
            className="h-10 min-w-[140px] shrink-0 rounded-lg px-6 sm:px-8"
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}
