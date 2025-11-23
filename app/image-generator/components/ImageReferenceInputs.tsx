"use client";

import { useState } from "react";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Upload, X, Plus } from "lucide-react";
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

interface ImageReferenceInputsProps {
  onGenerate?: (params: any) => void;
}

/**
 * Image Reference input form with dynamic model-based fields
 * Core fields: image upload, prompt, model selector
 * Dynamic fields: based on selected model's settings
 */
export default function ImageReferenceInputs({
  onGenerate,
}: ImageReferenceInputsProps) {
  const [selectedModel, setSelectedModel] = useState("runwaygen4");
  const [prompt, setPrompt] = useState("");
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [modelParams, setModelParams] = useState<Record<string, any>>({});

  const model = getModelById(selectedModel);
  const settings = model?.settings || {};
  const maxFiles = settings.reference_images?.max_files || 3;

  const handleParamChange = (key: string, value: any) => {
    setModelParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxFiles - referenceImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    setReferenceImages((prev) => [...prev, ...filesToAdd]);
  };

  const handleRemoveImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate({
        model: selectedModel,
        prompt,
        reference_images: referenceImages,
        ...modelParams,
      });
    }
  };

  const isGenerateDisabled =
    !prompt.trim() || !selectedModel || referenceImages.length === 0;

  // Extract specific settings for the footer
  const aspectRatioSetting = settings.aspect_ratio;
  const resolutionSetting = settings.resolution;
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
    "prompt",
    "reference_images",
    "aspect_ratio",
    "resolution",
    "num_images",
  ];

  // Helper function to normalize options (handle both string and object formats)
  const normalizeOption = (option: string | { value: string; label: string }) => {
    if (typeof option === "string") {
      return { value: option, label: option };
    }
    return option;
  };

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
                {referenceImages.length}/{maxFiles}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {referenceImages.map((file, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-[var(--color-border-container)]"
                >
                  <img
                    src={URL.createObjectURL(file)}
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
              ))}

              {referenceImages.length < maxFiles && (
                <div className="aspect-square">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={referenceImages.length >= maxFiles}
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
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how you want to use the reference images..."
              className="min-h-[120px] w-full resize-none rounded-lg border-gray-200 bg-gray-50 p-4 text-base focus:border-blue-500 focus:ring-0 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)] dark:placeholder:text-[var(--color-text-3)]"
            />
          </div>
        </div>
      </div>

      {/* Fixed Footer - Always at bottom */}
      <div className="border-t border-gray-200 bg-white px-[var(--spacing-page-padding)] py-[var(--spacing-footer-padding)] dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)]">
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
                    {aspectRatioSetting.options.map((option: string | { value: string; label: string }) => {
                      const normalized = normalizeOption(option);
                      return (
                        <SelectItem
                          key={normalized.value}
                          value={normalized.value}
                          className="rounded-lg"
                        >
                          {normalized.label}
                        </SelectItem>
                      );
                    })}
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
