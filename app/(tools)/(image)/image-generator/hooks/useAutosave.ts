/**
 * Autosave Hook for Image Generator
 * 
 * Re-exports the shared autosave utilities configured for image generation.
 * Maintains backward compatibility with existing imports.
 * 
 * Reasoning: Delegates to shared implementation to eliminate code duplication
 * while preserving the existing API for this module.
 */

import { useCallback } from "react";
import { imageAutosave } from "@/app/hooks/useAutosave";
import { useImageGenerationStore } from "../store/useImageGenerationStore";

/**
 * Hook to enable autosave functionality
 * Saves field values to localStorage after user stops typing
 */
export function useAutosave() {
  const fieldValues = useImageGenerationStore((s) => s.fieldValues);
  const selectedModelId = useImageGenerationStore((s) => s.selectedModelId);
  const activeTab = useImageGenerationStore((s) => s.activeTab);
  const updateFields = useImageGenerationStore((s) => s.updateFields);

  // Memoize loadDraft to prevent infinite loops in useEffect
  const loadDraft = useCallback(
    (values: Record<string, unknown>) => {
      updateFields(values as Record<string, any>);
    },
    [updateFields]
  );

  // Use the shared autosave hook
  imageAutosave.useAutosave(
    { fieldValues, selectedModelId, activeTab },
    loadDraft
  );
}

/**
 * Clear saved draft
 */
export const clearAutosavedDraft = imageAutosave.clearDraft;

/**
 * Check if draft exists
 */
export const hasAutosavedDraft = imageAutosave.hasDraft;
