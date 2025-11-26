"use client";

import { useState, useMemo } from "react";
import { Check, Search, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { getAllModels, getModelById } from "../lib/modelRegistry";
import { modelOptions } from "../_config/constants";
import Image from "next/image";
import { useImageGenerationStore } from "../store/useImageGenerationStore";

/**
 * Enhanced dialog-based model selector with logos, preview images, and search
 * Features responsive design with proper scrolling for all screen sizes
 * 
 * Refactored to use Zustand store - eliminates prop drilling
 * 
 * Reasoning: Using dialog instead of dropdown allows for richer model presentation
 * with logos, preview images, and better categorization while maintaining
 * accessibility and responsive behavior
 */
export default function ModelSelectorDialog() {
  const selectedModelId = useImageGenerationStore((s) => s.selectedModelId);
  const setModel = useImageGenerationStore((s) => s.setModel);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("popular");
  
  const models = getAllModels();
  const selectedModel = selectedModelId ? getModelById(selectedModelId) : null;

  // Create a map of model data from constants for quick lookup
  const modelDataMap = useMemo(() => {
    const map: Record<string, any> = {};
    modelOptions.forEach((option) => {
      map[option.value] = option;
    });
    return map;
  }, []);

  // Get enriched model data with logos and previews
  const enrichedModels = useMemo(() => {
    return models.map((model) => ({
      ...model,
      logo: modelDataMap[model.id]?.logo || null,
      previewImage: modelDataMap[model.id]?.previewImage || null,
      categories: modelDataMap[model.id]?.categories || [],
    }));
  }, [models, modelDataMap]);

  // Filter models based on search query and category
  const filteredModels = useMemo(() => {
    let filtered = enrichedModels;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.description.toLowerCase().includes(query) ||
          model.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((model) =>
        model.categories?.includes(selectedCategory)
      );
    }

    return filtered;
  }, [enrichedModels, searchQuery, selectedCategory]);

  const selectedModelData = selectedModelId ? modelDataMap[selectedModelId] : null;

  const categories = [
    { id: "all", label: "All Models" },
    { id: "popular", label: "Popular" },
    { id: "recommended", label: "Recommended" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="group flex h-auto w-full items-center justify-start gap-2 md:gap-3 rounded-lg border border-gray-200 bg-white px-3 md:px-4 py-2.5 md:py-3 text-left transition-all hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-0 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)] dark:hover:bg-[var(--color-bg-secondary)] dark:focus-visible:ring-[var(--color-border-component)]"
        >
          {selectedModelData?.logo && (
            <div className="relative h-6 w-6 md:h-8 md:w-8 shrink-0 overflow-hidden rounded-md bg-white p-0.5 md:p-1">
              <Image
                src={selectedModelData.logo}
                alt={selectedModel?.name || "Model"}
                fill
                className="object-contain"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col items-start overflow-hidden">
            <span className="text-sm md:text-base font-semibold text-gray-900 dark:text-[var(--color-text-1)] truncate w-full">
              {selectedModel?.name || "Select Model"}
            </span>
            {selectedModel?.description && (
              <span className="truncate text-[10px] md:text-xs text-gray-500 dark:text-[var(--color-text-3)] w-full">
                {selectedModel.description}
              </span>
            )}
          </div>
          <span className="text-[10px] md:text-xs text-gray-400 dark:text-[var(--color-text-3)] shrink-0">
            Change
          </span>
        </button>
      </DialogTrigger>

      {/* Dialog - Full width on mobile, max-w-6xl on desktop */}
      <DialogContent className="max-h-[90vh] md:max-h-[95vh] w-[95vw] md:max-w-6xl gap-0 overflow-hidden rounded-xl md:rounded-[18px] p-0 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-dialog)] focus-visible:ring-gray-600 dark:focus-visible:ring-[var(--color-border-component)]">
        <DialogHeader className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 dark:border-[var(--color-border-container)]">
          <DialogTitle className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-[var(--color-text-1)]">
            Select AI Model
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-gray-600 dark:text-[var(--color-text-3)]">
            Choose from {models.length}+ AI models
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 dark:border-[var(--color-border-container)]">
          {/* Search Bar - Touch-friendly */}
          <div className="relative mb-2 md:mb-3">
            <Search className="absolute left-3 md:left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-gray-400 dark:text-[var(--color-text-3)]" />
            <Input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 md:h-12 w-full rounded-lg md:rounded-xl border-0 bg-gray-100 pl-10 md:pl-12 pr-10 md:pr-12 text-sm md:text-base font-medium shadow-inner focus-visible:ring-1 focus-visible:ring-gray-400 dark:bg-[var(--color-bg-secondary)] dark:text-[var(--color-text-1)] dark:placeholder:text-[var(--color-text-3)] dark:focus-visible:ring-[var(--color-border-component)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-[var(--color-text-3)] dark:hover:text-[var(--color-text-2)] p-1"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            )}
          </div>

          {/* Category Tabs - Scrollable */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "shrink-0 rounded-full px-3 md:px-4 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                  selectedCategory === category.id
                    ? "bg-gray-800 text-white dark:bg-[var(--color-bg-secondary)] dark:text-[var(--color-text-1)]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-2)] dark:hover:bg-[var(--color-bg-secondary)]"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Model Grid */}
        <div className="max-h-[calc(90vh-200px)] md:max-h-[calc(95vh-240px)] overflow-y-auto px-4 md:px-6 py-3 md:py-4">
          {filteredModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-[var(--color-text-3)]">
                No models found matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
              {filteredModels.map((model) => {
                const isSelected = selectedModelId === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      setModel(model.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-xl md:rounded-3xl border-2 text-left transition-all hover:shadow-lg",
                      isSelected
                        ? "border-gray-600 bg-gray-900 dark:border-[var(--color-border-component)] dark:bg-[var(--color-bg-secondary)]"
                        : "border-gray-200 bg-white hover:border-gray-300 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:hover:border-[var(--color-border-component)] dark:hover:bg-[var(--color-bg-secondary)]"
                    )}
                  >
                    {/* Preview Image - Main Focus */}
                    {model.previewImage && (
                      <div className="relative aspect-[3/2] w-full overflow-hidden bg-gray-100 dark:bg-[var(--color-bg-page)]">
                        <Image
                          src={model.previewImage}
                          alt={model.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        
                        {/* Featured Badge on Image */}
                        {model.featured && (
                          <div className="absolute left-1.5 top-1.5 md:left-2 md:top-2">
                            <span className="rounded-full bg-yellow-500/90 px-1 md:px-1.5 py-0.5 text-[8px] md:text-[9px] font-bold text-white backdrop-blur-sm shadow-sm">
                              FEATURED
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Model Info Footer - Compact on mobile */}
                    <div className="flex flex-col gap-1 md:gap-1.5 p-2 md:p-3">
                      <div className="flex items-start justify-between gap-1.5 md:gap-2">
                        <div className="flex items-center gap-1 md:gap-1.5 overflow-hidden">
                          {model.logo && (
                            <div className="relative h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 overflow-hidden rounded bg-white p-0.5 shadow-sm">
                              <Image
                                src={model.logo}
                                alt={model.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                          <span className="truncate text-[10px] md:text-xs font-bold text-gray-900 dark:text-[var(--color-text-1)]">
                            {model.name}
                          </span>
                        </div>
                        
                        {isSelected && (
                          <div className="flex h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 items-center justify-center rounded-full bg-blue-500 shadow-sm dark:bg-blue-600">
                            <Check className="h-2 w-2 md:h-2.5 md:w-2.5 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* Credits Info */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-0.5 md:gap-1 rounded-full bg-gray-100 px-1 md:px-1.5 py-0.5 text-[8px] md:text-[9px] font-medium text-gray-600 dark:bg-[var(--color-bg-tertiary)] dark:text-[var(--color-text-2)]">
                          ⚡ {model.credits_per_generation || 1} credit{model.credits_per_generation !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
