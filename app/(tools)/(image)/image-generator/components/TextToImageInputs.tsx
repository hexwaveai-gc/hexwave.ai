"use client";

import { useState, useMemo } from "react";   
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { RefreshCw } from "lucide-react";
import ModelSelectorDialog from "./ModelSelectorDialog";
import AdvancedSettingsDialog from "./AdvancedSettingsDialog";
import PrimaryFieldsRenderer, { getPrimaryFieldNames } from "./PrimaryFieldsRenderer";
import { useImageGenerationStore } from "../store/useImageGenerationStore";
import { useFieldValue, useIsFormValid } from "../store/selectors";

/**
 * Text to Image input form with dynamic model-based fields
 * Core fields: prompt, model selector
 * Dynamic fields: based on selected model's settings
 * 
 * Refactored to use Zustand store - eliminates prop drilling
 */
// Hints pool with multiple sets of prompts
const HINTS_POOL = [
  [
    { label: "Supermodel", prompt: "A stunning supermodel walking down a high-fashion runway, elegant pose, professional photography, studio lighting, high detail, fashion photography style" },
    { label: "Retro Boy", prompt: "A retro-styled portrait of a young man, 1980s aesthetic, vintage clothing, film grain, nostalgic atmosphere, warm tones, classic photography" },
  ],
  [
    { label: "Chinese painting", prompt: "Traditional Chinese ink painting style, mountains and rivers, misty landscape, calligraphy brush strokes, serene and peaceful, monochrome with subtle colors, ancient art style" },
    { label: "Retro Girl", prompt: "Vintage portrait of a beautiful woman, 1950s pin-up style, retro fashion, classic Hollywood glamour, soft lighting, nostalgic color grading" },
  ],
  [
    { label: "Stylish Boy", prompt: "A fashionable young man in modern streetwear, urban setting, contemporary style, dynamic pose, vibrant colors, professional portrait photography" },
    { label: "B&W Male Portrait", prompt: "Black and white portrait of a distinguished man, dramatic lighting, high contrast, professional headshot, timeless elegance, monochrome photography" },
  ],
  [
    { label: "Futuristic City", prompt: "A futuristic cyberpunk cityscape at night, neon lights, flying vehicles, towering skyscrapers, rain-soaked streets, vibrant colors, sci-fi atmosphere" },
    { label: "Nature Landscape", prompt: "Breathtaking mountain landscape at sunset, golden hour lighting, dramatic clouds, pristine nature, wide angle view, cinematic composition, natural beauty" },
  ],
  [
    { label: "Abstract Art", prompt: "Abstract artistic composition, vibrant colors blending together, fluid shapes, modern art style, creative expression, dynamic movement, contemporary design" },
    { label: "Vintage Car", prompt: "Classic vintage car from the 1960s, polished chrome, retro styling, nostalgic atmosphere, warm lighting, automotive photography, timeless beauty" },
  ],
];

export default function TextToImageInputs() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get state from store
  const selectedModel = useImageGenerationStore((s) => s.selectedModel);
  const selectedModelId = useImageGenerationStore((s) => s.selectedModelId);
  const prompt = useFieldValue<string>("prompt", "");
  const hintsIndex = useImageGenerationStore((s) => s.hintsIndex);
  const setHintsIndex = useImageGenerationStore((s) => s.setHintsIndex);
  const updateField = useImageGenerationStore((s) => s.updateField);
  const startGeneration = useImageGenerationStore((s) => s.startGeneration);
  const isFormValid = useIsFormValid();

  // Fields to exclude from Advanced Dialog (because they are in footer or main area)
  const excludedFields = [
    "prompt",
    "reference_images", // Not used in Text to Image
    ...getPrimaryFieldNames(), // Exclude all primary fields
  ];

  // Get current hints based on index
  const currentHints = useMemo(() => {
    return HINTS_POOL[hintsIndex % HINTS_POOL.length];
  }, [hintsIndex]);

  // Handle hint click - fill textarea with prompt
  const handleHintClick = (hintPrompt: string) => {
    updateField("prompt", hintPrompt);
  };

  // Handle refresh - change to next set of hints with animation
  const handleRefreshHints = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setHintsIndex((hintsIndex + 1) % HINTS_POOL.length);
      setIsRefreshing(false);
    }, 500);
  };
  
  // Handle generate
  const handleGenerate = async () => {
    try {
      await startGeneration();
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable Content - Prompt with fixed compact height */}
      <div className="flex-1 overflow-y-auto px-3 md:px-[var(--spacing-page-padding)] py-4 md:py-[var(--spacing-element-gap)]">
        <div className="flex flex-col space-y-2 md:space-y-3">
          <Label className="text-xs md:text-sm font-medium text-[var(--color-text-1)]">
            Prompt
          </Label>
          
          {/* Combined Container */}
          <div className="relative flex flex-col rounded-lg border border-[var(--color-border-container)] bg-[var(--color-bg-primary)] focus-within:border-[var(--color-theme-2)] transition-colors">
            <Textarea
              value={prompt}
              onChange={(e) => updateField("prompt", e.target.value)}
              placeholder="Please describe your creative ideas for the image..."
              className="min-h-[140px] md:min-h-[180px] w-full max-w-full resize-none border-0 bg-transparent p-3 md:p-4 text-sm md:text-base text-[var(--color-text-1)] placeholder:text-[var(--color-text-3)] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />

            {/* Hints Section - Inside the border, scrollable on mobile */}
            <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 pb-3 md:pb-4 pt-1 md:pt-2 overflow-x-auto scrollbar-none">
              <Label className="text-xs md:text-sm font-medium text-[var(--color-text-1)] whitespace-nowrap shrink-0">
                Hints:
              </Label>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {currentHints.map((hint, index) => (
                  <button
                    key={index}
                    onClick={() => handleHintClick(hint.prompt)}
                    className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium text-[var(--color-text-2)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-1)] transition-colors border border-transparent hover:border-[var(--color-border-container)] whitespace-nowrap shrink-0"
                    type="button"
                  >
                    {hint.label}
                  </button>
                ))}
                <button
                  onClick={handleRefreshHints}
                  className="ml-auto p-1.5 md:p-2 rounded-lg text-[var(--color-text-2)] hover:text-[var(--color-text-1)] hover:bg-[var(--color-bg-secondary)] transition-colors shrink-0"
                  type="button"
                  aria-label="Refresh hints"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer - Always at bottom, compact on mobile */}
      <div className="mt-auto bg-[var(--color-bg-primary)] px-3 md:px-[var(--spacing-page-padding)] py-3 md:py-[var(--spacing-footer-padding)] border-t border-[var(--color-border-container)] md:border-t-0">
        {/* Model Selection */}
        <div className="mb-3 md:mb-4">
          <Label className="mb-1.5 md:mb-2 block text-xs md:text-sm font-medium text-[var(--color-text-1)]">
            Model
          </Label>
          <ModelSelectorDialog />
        </div>

        {/* Controls Row - Stack on mobile */}
        <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3">
          {/* Primary Fields - Scroll horizontally on mobile */}
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            <PrimaryFieldsRenderer />
            <AdvancedSettingsDialog excludeFields={excludedFields} />
          </div>

          {/* Generate Button - Full width on mobile */}
          <Button
            onClick={handleGenerate}
            disabled={!isFormValid || !selectedModelId}
            variant="generate"
            className="h-11 md:h-10 w-full md:w-auto md:min-w-[140px] shrink-0 rounded-lg px-6"
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}
