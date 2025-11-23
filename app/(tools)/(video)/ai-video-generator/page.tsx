"use client";

import { useState } from "react";
import { Video, Image, Layers } from "lucide-react";
import GeneratorLayout from "@/app/components/shared/GeneratorLayout";
import GeneratorTabs from "@/app/components/shared/GeneratorTabs";
import ResultsPanel from "@/app/components/shared/ResultsPanel";
import GenerateButton from "@/app/components/shared/GenerateButton";
import SettingsRow, { Setting } from "@/app/components/shared/SettingsRow";
import VideoModelSelector from "./components/VideoModelSelector";
import { TextToVideoInputs } from "./components/tabs/TextToVideoInputs";
import { ImageToVideoInputs } from "./components/tabs/ImageToVideoInputs";
import { MultiElementsInputs } from "./components/tabs/MultiElementsInputs";
import {
  getVideoModelById,
  getAllVideoModels,
} from "./configs/videoModelRegistry";

/**
 * AI Video Generator Page
 * Refactored to use shared components for consistency with image generator
 * 
 * Reasoning: Eliminates code duplication, provides resizable layout,
 * sophisticated results panel, and better model selection UX
 */
export default function AiVideoGeneratorPage() {
  // Model selection state
  const [selectedModel, setSelectedModel] = useState("veo-3.1");
  const model = getVideoModelById(selectedModel);

  // Tab state
  const [activeTab, setActiveTab] = useState("text-to-video");

  // Form state
  const [prompt, setPrompt] = useState("");
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [duration, setDuration] = useState(model?.settings.duration?.default || "5");
  const [aspectRatio, setAspectRatio] = useState(
    model?.settings.aspectRatio?.default || "16:9"
  );
  const [outputCount, setOutputCount] = useState("1");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<string[]>([]);

  /**
   * Handle video generation
   * Reasoning: Centralized generation logic with state management
   */
  const handleGenerate = async () => {
    console.log("Generating video with:", {
      model: selectedModel,
      mode: activeTab,
      prompt,
      soundEffects: soundEffectsEnabled,
      duration,
      aspectRatio,
      outputCount,
    });

    setIsGenerating(true);

    // Simulate generation (TODO: Connect to actual API)
    setTimeout(() => {
      setGeneratedVideos([
        "https://via.placeholder.com/800x450/000000/FFFFFF/?text=Video+1",
      ]);
      setIsGenerating(false);
    }, 3000);
  };

  // Update duration options when model changes
  const durationOptions =
    model?.settings.duration?.options.map((opt) => ({
      value: opt,
      label: `${opt}s`,
    })) || [];

  // Update aspect ratio options when model changes
  const aspectRatioOptions = model?.settings.aspectRatio?.options || [];

  // Settings configuration for SettingsRow
  const settings: Setting[] = [
    {
      id: "duration",
      value: duration,
      options: durationOptions,
      onChange: setDuration,
      ariaLabel: "Duration",
    },
    {
      id: "aspect-ratio",
      value: aspectRatio,
      options: aspectRatioOptions,
      onChange: setAspectRatio,
      ariaLabel: "Aspect Ratio",
    },
    {
      id: "output-count",
      value: outputCount,
      options: [
        { value: "1", label: "1 Output" },
        { value: "2", label: "2 Outputs" },
        { value: "3", label: "3 Outputs" },
        { value: "4", label: "4 Outputs" },
      ],
      onChange: setOutputCount,
      ariaLabel: "Output Count",
    },
  ];

  // Tab configuration
  const tabs = [
    {
      id: "text-to-video",
      label: "Text to Video",
      icon: <Video className="h-4 w-4" />,
      content: (
        <TextToVideoInputs
          prompt={prompt}
          onPromptChange={setPrompt}
          soundEffectsEnabled={soundEffectsEnabled}
          onSoundEffectsToggle={setSoundEffectsEnabled}
          supportsAudio={model?.settings.supportsAudioGeneration}
        />
      ),
    },
    {
      id: "image-to-video",
      label: "Image to Video",
      icon: <Image className="h-4 w-4" />,
      content: (
        <ImageToVideoInputs
          prompt={prompt}
          onPromptChange={setPrompt}
          supportsMotionControl={model?.settings.supportsMotionControl}
        />
      ),
    },
    {
      id: "multi-elements",
      label: "Multi-Elements",
      icon: <Layers className="h-4 w-4" />,
      content: <MultiElementsInputs />,
    },
  ];

  return (
    <GeneratorLayout
      inputPanel={
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-[var(--spacing-page-padding)] pt-[var(--spacing-page-padding)] pb-[var(--spacing-header-bottom)] dark:border-[var(--color-border-container)]">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--color-text-1)]">
              AI Video Generator
            </h1>
          </div>

          {/* Tabs Content - Scrollable */}
          <div className="flex-1 overflow-hidden">
            <GeneratorTabs
              tabs={tabs}
              defaultTab="text-to-video"
              onTabChange={setActiveTab}
            />
          </div>

          {/* Footer - Model, Settings, Generate Button */}
          <div className="border-t border-gray-200 bg-white px-[var(--spacing-page-padding)] py-[var(--spacing-footer-padding)] dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-page)]">
            {/* Model Selection */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
                Model
              </label>
              <VideoModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
              />
            </div>

            {/* Settings Row */}
            <div className="mb-4">
              <SettingsRow settings={settings} columns={3} />
            </div>

            {/* Generate Button */}
            <GenerateButton
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              isLoading={isGenerating}
              variant="neon"
              text="Generate"
              className="w-full"
            />
          </div>
        </div>
      }
      resultsPanel={
        <ResultsPanel
          isLoading={isGenerating}
          isEmpty={generatedVideos.length === 0}
          loadingMessage="Creating your video masterpiece..."
          emptyMessage="Configure your settings and generate to see results here"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-6">
            {generatedVideos.map((videoUrl, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)]"
              >
                <div className="aspect-video bg-gray-100 dark:bg-[var(--color-bg-secondary)]">
                  <img
                    src={videoUrl}
                    alt={`Generated ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-transform hover:scale-105 dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)]">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ResultsPanel>
      }
      defaultLeftSize={35}
      defaultRightSize={65}
      minLeftSize={25}
      minRightSize={50}
    />
  );
}
