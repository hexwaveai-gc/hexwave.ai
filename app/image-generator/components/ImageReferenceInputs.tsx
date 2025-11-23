"use client";

import { useState } from "react";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Wand2, Upload, X } from "lucide-react";
import ModelSelector from "./ModelSelector";
import DynamicFieldRenderer from "./DynamicFieldRenderer";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Image Reference
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Generate images using reference images
        </p>
      </div>

      {/* Core Field: Model Selector */}
      <ModelSelector value={selectedModel} onChange={setSelectedModel} />

      {/* Core Field: Image Upload */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Reference Images <span className="text-red-500">*</span>
        </Label>

        {/* Upload Area */}
        <div className="rounded-[18px] border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-colors hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={referenceImages.length >= maxFiles}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`flex cursor-pointer flex-col items-center ${
              referenceImages.length >= maxFiles
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            <Upload className="mb-2 h-10 w-10 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Click to upload images
            </span>
            <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Up to {maxFiles} images • PNG, JPG, WebP
            </span>
          </label>
        </div>

        {/* Image Previews */}
        {referenceImages.length > 0 && (
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
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {settings.reference_images?.description ||
            "Upload reference images to guide generation"}
        </p>
      </div>

      {/* Core Field: Prompt */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Prompt <span className="text-red-500">*</span>
        </Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe how you want to use the reference images..."
          className="min-h-[100px] rounded-[18px] resize-none"
        />
      </div>

      {/* Dynamic Model-Specific Fields */}
      {model && (
        <DynamicFieldRenderer
          settings={settings}
          values={modelParams}
          onChange={handleParamChange}
          excludeFields={["prompt"]}
        />
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerateDisabled}
        className="w-full rounded-[18px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        size="lg"
      >
        <Wand2 className="mr-2 h-5 w-5" />
        Generate Image
      </Button>
    </div>
  );
}

