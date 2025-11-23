"use client";

import { useState } from "react";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Upload, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import ModelSelectorDialog from "./ModelSelectorDialog";
import AdvancedSettingsDialog from "./AdvancedSettingsDialog";
import { getModelById } from "../lib/modelRegistry";

interface RestyleInputsProps {
  onGenerate?: (params: any) => void;
}

/**
 * Restyle input form for transforming existing images
 * Core fields: original image upload, style prompt, model selector
 * Dynamic fields: based on selected model's settings
 */
export default function RestyleInputs({ onGenerate }: RestyleInputsProps) {
  const [selectedModel, setSelectedModel] = useState("flux");
  const [stylePrompt, setStylePrompt] = useState("");
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [modelParams, setModelParams] = useState<Record<string, any>>({});

  const model = getModelById(selectedModel);
  const settings = model?.settings || {};

  const handleParamChange = (key: string, value: any) => {
    setModelParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage(file);
    }
  };

  const handleRemoveImage = () => {
    setOriginalImage(null);
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate({
        model: selectedModel,
        style_prompt: stylePrompt,
        original_image: originalImage,
        ...modelParams,
      });
    }
  };

  const isGenerateDisabled =
    !stylePrompt.trim() || !selectedModel || !originalImage;

  // Extract specific settings for the footer
  const aspectRatioSetting = settings.aspect_ratio;
  const numImagesSetting = settings.num_images;

  // Calculate generation credits (dynamic - ready for backend integration)
  const calculateCredits = () => {
    // TODO: Replace with actual backend call
    // For now, calculate based on model and settings
    const baseCredits = model?.credits_per_generation || 1;
    const numImages = numImagesSetting 
      ? (modelParams.num_images || numImagesSetting.default || 1)
      : 1;
    return baseCredits * numImages;
  };

  const creditsRequired = calculateCredits();

  // Fields to exclude from Advanced Dialog
  const excludedFields = [
    "prompt", // not used here but good to exclude if present
    "reference_images",
    "aspect_ratio",
    "num_images",
    "resolution",
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

            {!originalImage ? (
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
            ) : (
              <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-[var(--color-border-container)]">
                <img
                  src={URL.createObjectURL(originalImage)}
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
            )}
          </div>

          {/* Style Prompt */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
              Style Prompt
            </Label>
            <Textarea
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
              placeholder="Describe the style you want to apply..."
              className="min-h-[120px] w-full resize-none rounded-lg border-gray-200 bg-gray-50 p-4 text-base focus:border-blue-500 focus:ring-0 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)] dark:placeholder:text-[var(--color-text-3)]"
            />
          </div>
        </div>
      </div>

      {/* Fixed Footer - Always at bottom */}
      <div className="border-t border-gray-200 bg-white px-[var(--spacing-page-padding)] py-[var(--spacing-footer-padding)] dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-page)]">
        {/* Model Selection */}
        <div className="mb-4">
          <Label className="mb-2 block text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
            Model
          </Label>
          <ModelSelectorDialog value={selectedModel} onChange={setSelectedModel} />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left Side - Controls */}
          <div className="flex items-center gap-3">
            {/* Aspect Ratio Dropdown */}
            {aspectRatioSetting && aspectRatioSetting.options && (
              <div className="w-24 shrink-0">
                <Select
                  value={
                    (modelParams.aspect_ratio as string) ||
                    aspectRatioSetting.default
                  }
                  onValueChange={(val) => handleParamChange("aspect_ratio", val)}
                >
                  <SelectTrigger className="h-10 rounded-lg border-gray-200 px-3 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {aspectRatioSetting.options.map((option: string) => (
                      <SelectItem
                        key={option.toString()}
                        value={option.toString()}
                        className="rounded-lg"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Num Images (Flux) */}
            {numImagesSetting && (
              <div className="w-24 shrink-0">
                <Select
                  value={
                    (modelParams.num_images as string) ||
                    numImagesSetting.default?.toString()
                  }
                  onValueChange={(val) =>
                    handleParamChange("num_images", Number(val))
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg border-gray-200 px-3 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem
                        key={num}
                        value={num.toString()}
                        className="rounded-lg"
                      >
                        {num} {num === 1 ? "Image" : "Images"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Advanced Settings */}
            <AdvancedSettingsDialog
              settings={settings}
              values={modelParams}
              onChange={handleParamChange}
              excludeFields={excludedFields}
            />
          </div>

          {/* Right Side - Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
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
