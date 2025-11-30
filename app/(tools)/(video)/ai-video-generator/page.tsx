"use client";

import { useMemo, useEffect, useCallback } from "react";
import { Video, Image, Layers } from "lucide-react";
import Sidebar from "@/app/components/common/sidebar";
import GeneratorLayout from "@/app/components/shared/GeneratorLayout";
import GeneratorTabs from "@/app/components/shared/GeneratorTabs";
import ResultsPanel from "@/app/components/shared/ResultsPanel";
import GenerateButton from "@/app/components/shared/GenerateButton";
import VideoModelSelector from "./components/VideoModelSelector";
import { DynamicFieldRenderer } from "./components/DynamicFieldRenderer";
import { useGenerationStore } from "./store/useGenerationStore";
import { useIsFormValid } from "./store/selectors";
import { MODELS } from "./configs/models.constant";

// Maps between store tab values and tab IDs for consistent state management
const TAB_TO_ID: Record<string, string> = {
  text: "text-to-video",
  image: "image-to-video", 
  video: "video-to-video",
};

const ID_TO_TAB: Record<string, "text" | "image" | "video"> = {
  "text-to-video": "text",
  "image-to-video": "image",
  "video-to-video": "video",
};

/**
 * AI Video Generator Page - Refactored with Dynamic Field System
 * 
 * Key improvements:
 * - Zero prop drilling: All state in Zustand
 * - DRY: Single DynamicFieldRenderer for all models
 * - Smart tabs: Filter models by category (Text/Image/Video)
 * - Smooth tab transitions with forceMount and CSS opacity
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

  // Convert store tab to tab ID for controlled tabs component
  const currentTabId = TAB_TO_ID[activeTab] || "text-to-video";

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

  // Auto-select first model when tab changes or when selected model isn't in current list
  // This runs after tab change to ensure smooth transition
  useEffect(() => {
    if (filteredModels.length > 0) {
      const isModelInCurrentTab = selectedModel && filteredModels.some((m) => m.id === selectedModel.id);
      if (!isModelInCurrentTab) {
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
    }
  };

  // Tab configuration - using memo to prevent unnecessary re-renders
  const tabs = useMemo(() => [
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
  ], []);

  // Handle tab change - memoized to prevent re-renders
  const handleTabChange = useCallback((tabId: string) => {
    const newTab = ID_TO_TAB[tabId] || "text";
    setActiveTab(newTab);
  }, [setActiveTab]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-20 h-screen overflow-hidden bg-[#0a0a0a] pb-16 md:pb-0">
        <GeneratorLayout
          inputPanel={
            <div className="flex h-full flex-col">
              {/* Header - compact on mobile */}
              <div className="border-b border-(--color-border-container) px-3 md:px-(--spacing-page-padding) pt-3 md:pt-(--spacing-page-padding) pb-2 md:pb-(--spacing-header-bottom)">
                <h1 className="text-lg md:text-2xl font-bold text-(--color-text-1)">
                  AI Video Generator
                </h1>
              </div>

              {/* Tabs Content - Scrollable with DynamicFieldRenderer */}
              <div className="flex-1 overflow-hidden">
                <GeneratorTabs
                  tabs={tabs}
                  value={currentTabId}
                  onTabChange={handleTabChange}
                />
              </div>

              {/* Footer - Model Selection, Generate Button - compact mobile spacing */}
              <div className="mt-auto bg-white px-3 md:px-(--spacing-page-padding) py-3 md:py-(--spacing-footer-padding) dark:bg-(--color-bg-primary) border-t border-gray-200 dark:border-(--color-border-container) md:border-t-0">
                {/* Model Selection */}
                <div className="mb-3 md:mb-4">
                  <label className="mb-1.5 md:mb-2 block text-xs md:text-sm font-medium text-gray-900 dark:text-(--color-text-1)">
                    Model
                  </label>
                  <VideoModelSelector
                    models={filteredModels}
                    onModelSelect={setModel}
                  />
                </div>

                {/* Generate Button - touch-friendly height */}
                <GenerateButton
                  onClick={handleGenerate}
                  disabled={!isFormValid || !selectedModel}
                  isLoading={isGenerating}
                  variant="generate"
                  text="Generate Video"
                  className="w-full h-11 md:h-10"
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
              {/* Responsive grid: 1 col on mobile, 2 cols on tablet+ */}
              <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 pt-3 md:pt-6">
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
                    {/* Overlay always visible on mobile for touch, hover on desktop */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100">
                      <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-transform hover:scale-105 active:scale-95 dark:bg-(--color-bg-primary) dark:text-(--color-text-1)">
                        Download
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] md:text-xs text-white backdrop-blur-sm">
                      {result.cost.toFixed(2)}M credits
                    </div>
                  </div>
                ))}
              </div>
            </ResultsPanel>
          }
          layoutId="generator-layout"
        />
      </main>
    </div>
  );
}
