"use client";

import { useState, useMemo } from "react";
import { Check, Search, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { cn } from "@/lib/utils";
import { getAllModels, getModelById } from "../lib/modelRegistry";
import { modelOptions } from "../_config/constants";
import Image from "next/image";

interface ModelSelectorDialogProps {
  value: string;
  onChange: (modelId: string) => void;
}

/**
 * Enhanced dialog-based model selector with logos, preview images, and search
 * Features responsive design with proper scrolling for all screen sizes
 * 
 * Reasoning: Using dialog instead of dropdown allows for richer model presentation
 * with logos, preview images, and better categorization while maintaining
 * accessibility and responsive behavior
 */
export default function ModelSelectorDialog({
  value,
  onChange,
}: ModelSelectorDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("popular");
  
  const models = getAllModels();
  const selectedModel = getModelById(value);

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

  const selectedModelData = modelDataMap[value];

  const categories = [
    { id: "all", label: "All Models" },
    { id: "popular", label: "Popular" },
    { id: "recommended", label: "Recommended" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="group flex h-auto w-full items-center justify-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-all hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-0 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)] dark:hover:bg-[var(--color-bg-secondary)] dark:focus-visible:ring-[var(--color-border-component)]"
        >
          {selectedModelData?.logo && (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-white p-1">
              <Image
                src={selectedModelData.logo}
                alt={selectedModel?.name || "Model"}
                fill
                className="object-contain"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col items-start overflow-hidden">
            <span className="text-base font-semibold text-gray-900 dark:text-[var(--color-text-1)]">
              {selectedModel?.name || "Select Model"}
            </span>
            {selectedModel?.description && (
              <span className="truncate text-xs text-gray-500 dark:text-[var(--color-text-3)]">
                {selectedModel.description}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 dark:text-[var(--color-text-3)]">
            Change
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] max-w-4xl gap-0 overflow-hidden rounded-[18px] p-0 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-dialog)] focus-visible:ring-gray-600 dark:focus-visible:ring-[var(--color-border-component)]">
        <DialogHeader className="border-b border-gray-200 px-6 py-4 dark:border-[var(--color-border-container)]">
          <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-[var(--color-text-1)]">
            Select AI Model
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-[var(--color-text-3)]">
            Choose from {models.length}+ cutting-edge AI models for image generation
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-[var(--color-border-container)]">
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[var(--color-text-3)]" />
            <Input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 rounded-lg dark:bg-[var(--color-bg-primary)] dark:border-[var(--color-border-container)] dark:text-[var(--color-text-1)] dark:placeholder:text-[var(--color-text-3)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-[var(--color-text-3)] dark:hover:text-[var(--color-text-2)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all",
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
        <div className="max-h-[calc(85vh-240px)] overflow-y-auto px-6 py-4">
          {filteredModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-[var(--color-text-3)]">
                No models found matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredModels.map((model) => {
                const isSelected = value === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onChange(model.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-[18px] border-2 text-left transition-all",
                      isSelected
                        ? "border-gray-600 bg-gray-900 dark:border-[var(--color-border-component)] dark:bg-[var(--color-bg-secondary)]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:hover:border-[var(--color-border-component)] dark:hover:bg-[var(--color-bg-secondary)]"
                    )}
                  >
                    {/* Preview Image */}
                    {model.previewImage && (
                      <div className="relative h-20 w-full overflow-hidden bg-gray-100 dark:bg-[var(--color-bg-page)]">
                        <Image
                          src={model.previewImage}
                          alt={model.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                      </div>
                    )}

                    {/* Model Info */}
                    <div className="flex flex-1 flex-col gap-1.5 p-3">
                      {/* Header with Logo and Name */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {model.logo && (
                            <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded bg-white p-0.5">
                              <Image
                                src={model.logo}
                                alt={model.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                          <span className="truncate text-xs font-semibold text-gray-900 dark:text-[var(--color-text-1)]">
                            {model.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-600 dark:bg-[var(--color-border-component)]">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Category Badge */}
                      <div className="text-[10px] font-medium text-gray-500 dark:text-[var(--color-text-3)]">
                        {model.category}
                      </div>

                      {/* Description */}
                      <p className="line-clamp-2 text-[10px] leading-relaxed text-gray-600 dark:text-[var(--color-text-3)]">
                        {model.description}
                      </p>

                      {/* Featured/Credits Badge */}
                      <div className="flex items-center gap-1.5">
                        {model.featured && (
                          <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-[9px] font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Featured
                          </span>
                        )}
                        {model.credits_per_generation && (
                          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-600 dark:bg-[var(--color-bg-tertiary)] dark:text-[var(--color-text-2)]">
                            {model.credits_per_generation} credit{model.credits_per_generation > 1 ? 's' : ''}
                          </span>
                        )}
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
