"use client";

import { useState } from "react";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Wand2 } from "lucide-react";
import ModelSelector from "./ModelSelector";
import DynamicFieldRenderer from "./DynamicFieldRenderer";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Text to Image
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Generate images from text descriptions
        </p>
      </div>

      {/* Core Field: Model Selector */}
      <ModelSelector value={selectedModel} onChange={setSelectedModel} />

      {/* Core Field: Prompt */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Prompt <span className="text-red-500">*</span>
        </Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="min-h-[120px] rounded-[18px] resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {settings.prompt?.description || "Describe your desired image"}
        </p>
      </div>

      {/* Dynamic Model-Specific Fields */}
      {model && (
        <DynamicFieldRenderer
          settings={settings}
          values={modelParams}
          onChange={handleParamChange}
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

