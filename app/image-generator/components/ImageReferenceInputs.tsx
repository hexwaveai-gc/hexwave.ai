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
import ModelSelector from "./ModelSelector";
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

  // Fields to exclude from Advanced Dialog
  const excludedFields = [
    "prompt",
    "reference_images",
    "aspect_ratio",
    "resolution",
    "num_images",
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                  className="group relative aspect-square overflow-hidden rounded-[18px] border border-gray-200 dark:border-gray-700"
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
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-800/70"
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
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Prompt <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how you want to use the reference images..."
              className="min-h-[120px] w-full resize-none rounded-[18px] border-gray-200 bg-gray-50 p-4 text-base focus:border-blue-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        {/* Model Selection */}
        <div className="mb-4">
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
        </div>

        {/* Controls Row */}
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
                <SelectTrigger className="h-10 rounded-[18px] border-gray-200 px-3 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[18px]">
                  {aspectRatioSetting.options.map((option) => (
                    <SelectItem
                      key={option.toString()}
                      value={option.toString()}
                      className="rounded-[18px]"
                    >
                      {option}
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

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="h-10 flex-1 rounded-[18px] bg-green-500 font-semibold text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}
