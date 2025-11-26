/**
 * Autosave Hook for Video Generator
 * 
 * Re-exports the shared autosave utilities configured for video generation.
 * Maintains backward compatibility with existing imports.
 * 
 * Reasoning: Delegates to shared implementation to eliminate code duplication
 * while preserving the existing API for this module.
 */

import { useCallback } from "react";
import { videoAutosave } from "@/app/hooks/useAutosave";
import { useGenerationStore } from "../store/useGenerationStore";

/**
 * Hook to enable autosave functionality
 * Saves field values to localStorage after user stops typing
 */
export function useAutosave() {
  const fieldValues = useGenerationStore((s) => s.fieldValues);
  const selectedModelId = useGenerationStore((s) => s.selectedModelId);
  const activeTab = useGenerationStore((s) => s.activeTab);
  const loadDraft = useGenerationStore((s) => s.loadDraft);

  // Memoize loadDraft wrapper to prevent infinite loops in useEffect
  const loadDraftCallback = useCallback(
    (values: Record<string, unknown>) => {
      loadDraft(values as Record<string, any>);
    },
    [loadDraft]
  );

  // Use the shared autosave hook
  videoAutosave.useAutosave(
    { fieldValues, selectedModelId, activeTab },
    loadDraftCallback
  );
}

/**
 * Clear saved draft
 */
export const clearAutosavedDraft = videoAutosave.clearDraft;

/**
 * Check if draft exists
 */
export const hasAutosavedDraft = videoAutosave.hasDraft;
