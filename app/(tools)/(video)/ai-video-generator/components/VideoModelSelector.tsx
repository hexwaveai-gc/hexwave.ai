"use client";

import { useState, useMemo } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { ModelType } from "../types/index.types";
import { Check, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGenerationStore } from "../store/useGenerationStore";
import { formatCostRange } from "../utils/costCalculator";
import MarqueeText from "@/app/components/shared/MarqueeText";

interface VideoModelSelectorProps {
  models: ModelType[];
  onModelSelect: (model: ModelType) => void;
}

/**
 * Enhanced Video Model Selector with Search and Filters
 * Refactored to work with models.constant.ts and Zustand
 * 
 * Features:
 * - Search by model name
 * - Filter by features (audio, 1080p, etc.)
 * - Show favorites and recent models
 * - Display cost ranges
 * - Category badges
 * 
 * Reasoning: Scales to 76 models with good UX, production-grade search/filter
 */
export default function VideoModelSelector({
  models,
  onModelSelect,
}: VideoModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const selectedModel = useGenerationStore((s) => s.selectedModel);
  const favoriteModels = useGenerationStore((s) => s.favoriteModels);
  const recentModels = useGenerationStore((s) => s.recentModels);
  const toggleFavorite = useGenerationStore((s) => s.toggleFavorite);

  // Filter models based on search and features
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      // Search filter
      const matchesSearch = search === "" ||
        model.name.toLowerCase().includes(search.toLowerCase()) ||
        model.provider?.toLowerCase().includes(search.toLowerCase()) ||
        model.description?.toLowerCase().includes(search.toLowerCase());

      // Feature filters
      const matchesFeatures = selectedFeatures.length === 0 || selectedFeatures.every((feature) => {
        if (feature === "audio") {
          return model.capabilities?.supportsAudioGeneration === true;
        }
        if (feature === "1080p") {
          return model.features?.includes("1080p") || model.features?.includes("2160p");
        }
        if (feature === "endFrame") {
          return model.capabilities?.supportsEndFrame === true;
        }
        if (feature === "fast") {
          return model.features?.includes("Fast");
        }
        return false;
      });

      return matchesSearch && matchesFeatures;
    });
  }, [models, search, selectedFeatures]);

  // Sort models: favorites first, then recent, then alphabetical
  const sortedModels = useMemo(() => {
    return [...filteredModels].sort((a, b) => {
      const aIsFavorite = favoriteModels.includes(a.id);
      const bIsFavorite = favoriteModels.includes(b.id);

      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;

      const aIsRecent = recentModels.includes(a.id);
      const bIsRecent = recentModels.includes(b.id);

      if (aIsRecent && !bIsRecent) return -1;
      if (!aIsRecent && bIsRecent) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [filteredModels, favoriteModels, recentModels]);

  const handleModelSelect = (model: ModelType) => {
    onModelSelect(model);
    setOpen(false);
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-auto w-full justify-between rounded-lg border-gray-200 px-4 py-3 text-left dark:border-(--color-border-container) dark:bg-(--color-bg-primary) dark:text-(--color-text-1) hover:dark:bg-(--color-bg-secondary)"
        >
          <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
            <span className="text-base font-medium truncate w-full">
              {selectedModel?.name || "Select Model"}
            </span>
            {selectedModel?.description && (
              <MarqueeText
                duration={8}
                direction="left"
                pauseOnHover={true}
                className="w-full"
                contentClassName="text-xs text-gray-500 dark:text-(--color-text-3)"
              >
                {selectedModel.description}
              </MarqueeText>
            )}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] rounded-lg dark:bg-(--color-bg-dialog) dark:border-(--color-border-container)">
        <DialogHeader>
          <DialogTitle className="text-xl dark:text-(--color-text-1)">
            Select Video Model
          </DialogTitle>
          <DialogDescription className="dark:text-(--color-text-3)">
            Choose from {models.length} available AI models
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-lg"
          />
        </div>

        {/* Feature Filters */}
        <div className="flex flex-wrap gap-2">
          {["audio", "1080p", "endFrame", "fast"].map((feature) => (
            <button
              key={feature}
              onClick={() => toggleFeature(feature)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                selectedFeatures.includes(feature)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-(--color-bg-primary) dark:text-(--color-text-2) dark:hover:bg-(--color-bg-secondary)"
              )}
            >
              {feature === "audio" && "Audio"}
              {feature === "1080p" && "HD"}
              {feature === "endFrame" && "End Frame"}
              {feature === "fast" && "Fast"}
            </button>
          ))}
        </div>

        {/* Model List - Scrollable */}
        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {sortedModels.length === 0 ? (
            <p className="text-center text-sm text-gray-500 dark:text-(--color-text-3) py-8">
              No models found matching your criteria
            </p>
          ) : (
            sortedModels.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition-all overflow-hidden",
                  selectedModel?.id === model.id
                    ? "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/20"
                    : "border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-(--color-bg-primary) dark:hover:bg-(--color-bg-secondary)"
                )}
              >
                {/* Provider Logo */}
                {model.logo && (
                  <img
                    src={model.logo}
                    alt={model.provider || ""}
                    className="h-8 w-8 rounded object-contain shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base font-semibold text-gray-900 dark:text-(--color-text-1) truncate">
                      {model.name}
                    </span>
                    {selectedModel?.id === model.id && (
                      <Check className="h-4 w-4 text-blue-600 shrink-0" />
                    )}
                    {favoriteModels.includes(model.id) && (
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
                    )}
                  </div>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-(--color-text-3) truncate">
                    {model.provider}
                  </p>

                  <p className="mt-1 text-sm text-gray-600 dark:text-(--color-text-2) line-clamp-2 break-words">
                    {model.description}
                  </p>

                  {/* Features badges */}
                  {model.features && model.features.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {model.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-(--color-bg-secondary) dark:text-(--color-text-3)"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Cost display */}
                  <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                    {formatCostRange(model)}
                  </p>
                </div>

                {/* Favorite Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(model.id);
                  }}
                  className="shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-(--color-bg-secondary) rounded"
                  aria-label="Toggle favorite"
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      favoriteModels.includes(model.id)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-400"
                    )}
                  />
                </button>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

