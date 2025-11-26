/**
 * Reusable Zustand Selectors for Image Generation
 * Optimized selectors for derived state
 * Prevents unnecessary re-renders
 */

import { useImageGenerationStore, ImageGenerationStore } from "./useImageGenerationStore";
import { Model } from "../lib/modelRegistry";
import { useShallow } from "zustand/react/shallow";

/**
 * Select visible fields based on model configuration and active tab
 */
export const selectVisibleFields = (state: ImageGenerationStore): string[] => {
  const { selectedModel, activeTab } = state;
  
  if (!selectedModel || !selectedModel.settings) {
    return [];
  }
  
  const settings = selectedModel.settings;
  const fields: string[] = [];
  
  // Add tab-specific fields
  if (activeTab === "text-to-image") {
    fields.push("prompt");
  } else if (activeTab === "image-reference") {
    fields.push("prompt", "reference_images");
  } else if (activeTab === "restyle") {
    fields.push("style_prompt", "original_image");
  }
  
  // Add model-specific fields from settings
  Object.keys(settings).forEach((key) => {
    // Exclude tab-specific fields that are already added
    if (
      key !== "prompt" &&
      key !== "reference_images" &&
      key !== "style_prompt" &&
      key !== "original_image"
    ) {
      fields.push(key);
    }
  });
  
  return fields;
};

/**
 * Select field configuration for a specific field
 */
export const selectFieldConfig = (fieldName: string) => (state: ImageGenerationStore) => {
  const { selectedModel } = state;
  if (!selectedModel || !selectedModel.settings) {
    return null;
  }
  return selectedModel.settings[fieldName] || null;
};

/**
 * Select if form is valid (all required fields filled and no errors)
 */
export const selectIsFormValid = (state: ImageGenerationStore): boolean => {
  const { selectedModel, fieldValues, fieldErrors, activeTab } = state;
  
  if (!selectedModel) {
    return false;
  }
  
  // Check if there are any errors
  if (Object.keys(fieldErrors).length > 0) {
    return false;
  }
  
  // Check required fields based on active tab
  if (activeTab === "text-to-image") {
    const prompt = fieldValues.prompt;
    if (!prompt || (typeof prompt === "string" && !prompt.trim())) {
      return false;
    }
  } else if (activeTab === "image-reference") {
    const prompt = fieldValues.prompt;
    const referenceImages = fieldValues.reference_images;
    if (!prompt || (typeof prompt === "string" && !prompt.trim())) {
      return false;
    }
    if (!referenceImages || (Array.isArray(referenceImages) && referenceImages.length === 0)) {
      return false;
    }
  } else if (activeTab === "restyle") {
    const stylePrompt = fieldValues.style_prompt;
    const originalImage = fieldValues.original_image;
    if (!stylePrompt || (typeof stylePrompt === "string" && !stylePrompt.trim())) {
      return false;
    }
    if (!originalImage) {
      return false;
    }
  }
  
  return true;
};

/**
 * Select field value with default
 */
export const selectFieldValue = <T = any>(fieldName: string, defaultValue?: T) => (
  state: ImageGenerationStore
): T => {
  return state.fieldValues[fieldName] ?? defaultValue;
};

/**
 * Select field error
 */
export const selectFieldError = (fieldName: string) => (state: ImageGenerationStore) => {
  return state.fieldErrors[fieldName] || null;
};

/**
 * Select if any field has errors
 */
export const selectHasErrors = (state: ImageGenerationStore): boolean => {
  return Object.keys(state.fieldErrors).length > 0;
};

/**
 * Select if model is a favorite
 */
export const selectIsModelFavorite = (modelId: string) => (state: ImageGenerationStore): boolean => {
  return state.favoriteModels.includes(modelId);
};

/**
 * Select if model is in recent list
 */
export const selectIsModelRecent = (modelId: string) => (state: ImageGenerationStore): boolean => {
  return state.recentModels.includes(modelId);
};

/**
 * Select model settings
 */
export const selectModelSettings = (state: ImageGenerationStore) => {
  return state.selectedModel?.settings || null;
};

/**
 * Hook to use visible fields (with shallow comparison to prevent re-renders)
 */
export function useVisibleFields() {
  return useImageGenerationStore(useShallow(selectVisibleFields));
}

/**
 * Hook to use form validity
 */
export function useIsFormValid() {
  return useImageGenerationStore(selectIsFormValid);
}

/**
 * Hook to use field value
 */
export function useFieldValue<T = any>(fieldName: string, defaultValue?: T) {
  return useImageGenerationStore(selectFieldValue(fieldName, defaultValue));
}

/**
 * Hook to use field error
 */
export function useFieldError(fieldName: string) {
  return useImageGenerationStore(selectFieldError(fieldName));
}

/**
 * Hook to check if model is favorite
 */
export function useIsModelFavorite(modelId: string) {
  return useImageGenerationStore(selectIsModelFavorite(modelId));
}

/**
 * Hook to check if model is recent
 */
export function useIsModelRecent(modelId: string) {
  return useImageGenerationStore(selectIsModelRecent(modelId));
}


