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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Restyle
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Transform an existing image with a new style
        </p>
      </div>

      {/* Core Field: Model Selector */}
      <ModelSelector value={selectedModel} onChange={setSelectedModel} />

      {/* Core Field: Original Image Upload */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Original Image <span className="text-red-500">*</span>
        </Label>

        {!originalImage ? (
          <div className="rounded-[18px] border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500">
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
              <Upload className="mb-2 h-12 w-12 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Click to upload original image
              </span>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, WebP up to 10MB
              </span>
            </label>
          </div>
        ) : (
          <div className="group relative overflow-hidden rounded-[18px] border border-gray-200 dark:border-gray-700">
            <img
              src={URL.createObjectURL(originalImage)}
              alt="Original"
              className="h-auto w-full object-contain"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute right-3 top-3 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Upload the image you want to restyle
        </p>
      </div>

      {/* Core Field: Style Prompt */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Style Prompt <span className="text-red-500">*</span>
        </Label>
        <Textarea
          value={stylePrompt}
          onChange={(e) => setStylePrompt(e.target.value)}
          placeholder="Describe the style you want to apply (e.g., 'watercolor painting', 'cyberpunk style', 'vintage photograph')..."
          className="min-h-[100px] rounded-[18px] resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Describe how you want to transform the original image
        </p>
      </div>

      {/* Dynamic Model-Specific Fields */}
      {model && (
        <DynamicFieldRenderer
          settings={settings}
          values={modelParams}
          onChange={handleParamChange}
          excludeFields={["prompt", "reference_images"]}
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
        Restyle Image
      </Button>
    </div>
  );
}

