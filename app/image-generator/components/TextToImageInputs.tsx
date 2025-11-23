"use client";

import { useState } from "react";   
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Wand2 } from "lucide-react";
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

interface TextToImageInputsProps {
  onGenerate?: (params: any) => void;
}

/**
 * Text to Image input form with dynamic model-based fields
 * Core fields: prompt, model selector
 * Dynamic fields: based on selected model's settings
 */
export default function TextToImageInputs({
  onGenerate,
}: TextToImageInputsProps) {
  const [selectedModel, setSelectedModel] = useState("runwaygen4");
  const [prompt, setPrompt] = useState("");
  const [modelParams, setModelParams] = useState<Record<string, any>>({});

  const model = getModelById(selectedModel);
  const settings = model?.settings || {};

  const handleParamChange = (key: string, value: any) => {
    setModelParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate({
        model: selectedModel,
        prompt,
        ...modelParams,
      });
    }
  };

  const isGenerateDisabled = !prompt.trim() || !selectedModel;

  // Extract specific settings for the footer
  const aspectRatioSetting = settings.aspect_ratio;
  const resolutionSetting = settings.resolution; // Using resolution instead of num_images for Runway
  const numImagesSetting = settings.num_images; // For Flux

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

  // Fields to exclude from Advanced Dialog (because they are in footer or main area)
  const excludedFields = [
    "prompt",
    "reference_images", // Not used in Text to Image
    "aspect_ratio",
    "resolution",
    "num_images",
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable Content - Prompt takes available space */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-page-padding)] py-[var(--spacing-element-gap)]">
        <div className="flex h-full flex-col space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
            Prompt <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the creative ideas for the image..."
            className="h-full min-h-[200px] flex-1 resize-none rounded-lg border-gray-200 bg-gray-50 p-4 text-base focus:border-blue-500 focus:ring-0 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)] dark:placeholder:text-[var(--color-text-3)]"
          />
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
                    {aspectRatioSetting.options.map((option) => (
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

            {/* Resolution or Count Dropdown */}
            {resolutionSetting && resolutionSetting.options && (
              <div className="w-28 shrink-0">
                <Select
                  value={
                    (modelParams.resolution as string) ||
                    resolutionSetting.default
                  }
                  onValueChange={(val) => handleParamChange("resolution", val)}
                >
                  <SelectTrigger className="h-10 rounded-lg border-gray-200 px-3 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {resolutionSetting.options.map((option) => (
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
