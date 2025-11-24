"use client";

import { useMemo, useEffect } from "react";
import { Video, Image, Layers } from "lucide-react";
import Sidebar from "@/app/components/common/Sidebar";
import GeneratorLayout from "@/app/components/shared/GeneratorLayout";
import GeneratorTabs from "@/app/components/shared/GeneratorTabs";
import ResultsPanel from "@/app/components/shared/ResultsPanel";
import GenerateButton from "@/app/components/shared/GenerateButton";
import VideoModelSelector from "./components/VideoModelSelector";
import { DynamicFieldRenderer } from "./components/DynamicFieldRenderer";
import { useGenerationStore } from "./store/useGenerationStore";
import { useIsFormValid } from "./store/selectors";
import { MODELS } from "./configs/models.constant";

/**
 * AI Video Generator Page - Refactored with Dynamic Field System
 * 
 * Key improvements:
 * - Zero prop drilling: All state in Zustand
 * - DRY: Single DynamicFieldRenderer for all models
 * - Smart tabs: Filter models by category (Text/Image/Video)
 * - Production-grade state management
 * 
 * Reasoning: Scales to 76+ models with zero code changes when adding new models.
 * All configuration driven by models.constant.ts.
 */
export default function AiVideoGeneratorPage() {
  // Get state from Zustand store
  const activeTab = useGenerationStore((s) => s.activeTab);
  const setActiveTab = useGenerationStore((s) => s.setActiveTab);
  const selectedModel = useGenerationStore((s) => s.selectedModel);
  const setModel = useGenerationStore((s) => s.setModel);
  const isGenerating = useGenerationStore((s) => s.isGenerating);
  const results = useGenerationStore((s) => s.results);
  const startGeneration = useGenerationStore((s) => s.startGeneration);
  const isFormValid = useIsFormValid();

  // Filter models by active tab
  const filteredModels = useMemo(() => {
    switch (activeTab) {
      case "text":
        return MODELS.TEXT_MODELS || [];
      case "image":
        return MODELS.IMAGE_MODELS || [];
      case "video":
        return MODELS.VIDEO_MODELS || [];
      default:
        return [];
    }
  }, [activeTab]);

  // Auto-select first model when no model is selected or when selected model is not in filtered list
  // Reasoning: Provides better UX by having a model ready to configure immediately
  useEffect(() => {
    if (filteredModels.length > 0) {
      // If no model is selected, or selected model is not in the current filtered list, select first model
      if (!selectedModel || !filteredModels.find((m) => m.id === selectedModel.id)) {
        setModel(filteredModels[0]);
      }
    }
  }, [filteredModels, selectedModel, setModel]);

  /**
   * Handle video generation
   * Reasoning: Uses Zustand store's async action
   */
  const handleGenerate = async () => {
    try {
      await startGeneration();
    } catch (error) {
      console.error("Generation failed:", error);
      // Error is already logged by store
    }
  };

  // Tab configuration with smart filtering
  const tabs = [
    {
      id: "text-to-video",
      label: "Text to Video",
      icon: <Video className="h-4 w-4" />,
      content: <DynamicFieldRenderer />,
    },
    {
      id: "image-to-video",
      label: "Image to Video",
      icon: <Image className="h-4 w-4" />,
      content: <DynamicFieldRenderer />,
    },
    {
      id: "video-to-video",
      label: "Video to Video",
      icon: <Layers className="h-4 w-4" />,
      content: <DynamicFieldRenderer />,
    },
  ];

  // Handle tab change - update Zustand state
  const handleTabChange = (tabId: string) => {
    const tabMap: Record<string, "text" | "image" | "video"> = {
      "text-to-video": "text",
      "image-to-video": "image",
      "video-to-video": "video",
    };
    setActiveTab(tabMap[tabId] || "text");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />
      <main className="flex-1 ml-20">
        <GeneratorLayout
          inputPanel={
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b border-gray-200 px-(--spacing-page-padding) pt-(--spacing-page-padding) pb-(--spacing-header-bottom) dark:border-(--color-border-container)">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-(--color-text-1)">
                  AI Video Generator
                </h1>
              </div>

              {/* Tabs Content - Scrollable with DynamicFieldRenderer */}
              <div className="flex-1 overflow-y-auto">
                <GeneratorTabs
                  tabs={tabs}
                  defaultTab="text-to-video"
                  onTabChange={handleTabChange}
                />
              </div>

              {/* Footer - Model Selection, Generate Button */}
              <div className="border-t border-gray-200 bg-white px-(--spacing-page-padding) py-(--spacing-footer-padding) dark:border-(--color-border-container) dark:bg-(--color-bg-page)">
                {/* Model Selection */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-(--color-text-1)">
                    Model
                  </label>
                  <VideoModelSelector
                    models={filteredModels}
                    onModelSelect={setModel}
                  />
                </div>

                {/* Generate Button */}
                <GenerateButton
                  onClick={handleGenerate}
                  disabled={!isFormValid || !selectedModel}
                  isLoading={isGenerating}
                  variant="generate"
                  text="Generate Video"
                  className="w-full"
                />
              </div>
            </div>
          }
          resultsPanel={
            <ResultsPanel
              isLoading={isGenerating}
              isEmpty={results.length === 0}
              loadingMessage="Creating your video masterpiece..."
              emptyMessage="Configure your settings and generate to see results here"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-6">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-(--color-border-container) dark:bg-(--color-bg-primary)"
                  >
                    <div className="aspect-video bg-gray-100 dark:bg-(--color-bg-secondary)">
                      <img
                        src={result.thumbnail || result.url}
                        alt={`Generated ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-transform hover:scale-105 dark:bg-(--color-bg-primary) dark:text-(--color-text-1)">
                        Download
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
                      {result.cost.toFixed(2)}M credits
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
      </main>
    </div>
  );
}
