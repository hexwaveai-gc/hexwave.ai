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
import ModelSelector from "./ModelSelector";
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
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex h-full flex-col space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Prompt <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the creative ideas for the image..."
            className="h-full min-h-[200px] flex-1 resize-none rounded-[18px] border-gray-200 bg-gray-50 p-4 text-base focus:border-blue-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800"
          />
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
                <SelectTrigger className="h-10 rounded-[18px] border-gray-200 px-3 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[18px]">
                  {resolutionSetting.options.map((option) => (
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
                <SelectTrigger className="h-10 rounded-[18px] border-gray-200 px-3 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[18px]">
                  {[1, 2, 3, 4].map((num) => (
                    <SelectItem
                      key={num}
                      value={num.toString()}
                      className="rounded-[18px]"
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
