/**
 * Reusable Zustand Selectors
 * Optimized selectors for derived state
 * Prevents unnecessary re-renders
 */

import { useGenerationStore, GenerationStore } from "./useGenerationStore";
import { ModelType } from "../types/index.types";
import { getFieldMetadata } from "../configs/fieldRegistry";
import { useShallow } from "zustand/react/shallow";

/**
 * Select visible fields based on model configuration
 * Only shows fields that are in model.fields and pass conditional logic
 */
export const selectVisibleFields = (state: GenerationStore): string[] => {
  const { selectedModel } = state;
  
  if (!selectedModel || !selectedModel.fields) {
    return [];
  }
  
  return selectedModel.fields.filter((fieldName) => {
    const metadata = getFieldMetadata(fieldName, selectedModel);
    
    // Check conditional logic
    if (metadata.conditional) {
      const { showIf, requiresCapability } = metadata.conditional;
      
      // Check showIf function
      if (showIf && !showIf(selectedModel)) {
        return false;
      }
      
      // Check required capability
      if (requiresCapability && selectedModel.capabilities) {
        const capabilityValue = selectedModel.capabilities[requiresCapability as keyof typeof selectedModel.capabilities];
        if (!capabilityValue) {
          return false;
        }
      }
    }
    
    return true;
  });
};

/**
 * Select field configuration for a specific field
 */
export const selectFieldConfig = (fieldName: string) => (state: GenerationStore) => {
  const { selectedModel } = state;
  return getFieldMetadata(fieldName, selectedModel);
};

/**
 * Select model capabilities
 */
export const selectModelCapabilities = (state: GenerationStore) => {
  return state.selectedModel?.capabilities || null;
};

/**
 * Select if form is valid (all required fields filled and no errors)
 */
export const selectIsFormValid = (state: GenerationStore): boolean => {
  const { selectedModel, fieldValues, fieldErrors } = state;
  
  if (!selectedModel) {
    return false;
  }
  
  // Check if there are any errors
  if (Object.keys(fieldErrors).length > 0) {
    return false;
  }
  
  // Check required fields
  const requiredFields = ["prompt"]; // Prompt is always required
  
  // Add fields that require user input based on model
  if (selectedModel.fields.includes("imageBase64")) {
    const metadata = getFieldMetadata("imageBase64", selectedModel);
    if (!metadata.conditional || metadata.conditional.showIf?.(selectedModel) !== false) {
      requiredFields.push("imageBase64");
    }
  }
  
  if (selectedModel.fields.includes("videoBase64")) {
    const metadata = getFieldMetadata("videoBase64", selectedModel);
    if (!metadata.conditional || metadata.conditional.showIf?.(selectedModel) !== false) {
      requiredFields.push("videoBase64");
    }
  }
  
  // Check if all required fields have values
  for (const field of requiredFields) {
    if (selectedModel.fields.includes(field)) {
      const value = fieldValues[field];
      if (!value || (typeof value === "string" && !value.trim())) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Select if model supports a specific feature
 */
export const selectSupportsFeature = (feature: keyof NonNullable<ModelType["capabilities"]>) => (
  state: GenerationStore
): boolean => {
  return state.selectedModel?.capabilities?.[feature] === true;
};

/**
 * Select field value with default
 */
export const selectFieldValue = <T = any>(fieldName: string, defaultValue?: T) => (
  state: GenerationStore
): T => {
  return state.fieldValues[fieldName] ?? defaultValue;
};

/**
 * Select field error
 */
export const selectFieldError = (fieldName: string) => (state: GenerationStore) => {
  return state.fieldErrors[fieldName] || null;
};

/**
 * Select if any field has errors
 */
export const selectHasErrors = (state: GenerationStore): boolean => {
  return Object.keys(state.fieldErrors).length > 0;
};

/**
 * Select cost display string
 */
export const selectCostDisplay = (state: GenerationStore): string => {
  return state.estimatedCost?.display || "Calculating...";
};

/**
 * Select cost breakdown
 */
export const selectCostBreakdown = (state: GenerationStore): string[] => {
  return state.estimatedCost?.breakdown || [];
};

/**
 * Select if model is a favorite
 */
export const selectIsModelFavorite = (modelId: string) => (state: GenerationStore): boolean => {
  return state.favoriteModels.includes(modelId);
};

/**
 * Select if model is in recent list
 */
export const selectIsModelRecent = (modelId: string) => (state: GenerationStore): boolean => {
  return state.recentModels.includes(modelId);
};

/**
 * Select models by category (for filtered display)
 */
export const selectModelsByCategory = (models: ModelType[]) => (state: GenerationStore): ModelType[] => {
  const { activeTab } = state;
  
  // Filter by active tab
  // This is a client-side filter; the models should already be filtered by the page component
  return models;
};

/**
 * Select generation progress percentage
 */
export const selectProgressPercentage = (state: GenerationStore): number => {
  return Math.min(100, Math.max(0, state.progress));
};

/**
 * Select latest result
 */
export const selectLatestResult = (state: GenerationStore) => {
  const { results } = state;
  return results.length > 0 ? results[results.length - 1] : null;
};

/**
 * Select total results count
 */
export const selectResultsCount = (state: GenerationStore): number => {
  return state.results.length;
};

/**
 * Hook to use visible fields (with shallow comparison to prevent re-renders)
 */
export function useVisibleFields() {
  return useGenerationStore(useShallow(selectVisibleFields));
}

/**
 * Hook to use form validity
 */
export function useIsFormValid() {
  return useGenerationStore(selectIsFormValid);
}

/**
 * Hook to use field value
 */
export function useFieldValue<T = any>(fieldName: string, defaultValue?: T) {
  return useGenerationStore(selectFieldValue(fieldName, defaultValue));
}

/**
 * Hook to use field error
 */
export function useFieldError(fieldName: string) {
  return useGenerationStore(selectFieldError(fieldName));
}

/**
 * Hook to check if model supports a feature
 */
export function useSupportsFeature(feature: keyof NonNullable<ModelType["capabilities"]>) {
  return useGenerationStore(selectSupportsFeature(feature));
}

