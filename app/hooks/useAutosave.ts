/**
 * Shared Autosave Hook Factory
 * 
 * Creates autosave functionality for any Zustand store.
 * Automatically saves form state to localStorage and restores on page load.
 * 
 * Reasoning: Extracted from image-generator and ai-video-generator to eliminate
 * duplicate code. Both tools had ~90% identical autosave implementations.
 */

import { useEffect } from "react";

/** Configuration for autosave behavior */
interface AutosaveConfig {
  /** Unique localStorage key for this autosave instance */
  storageKey: string;
  /** Delay in ms before saving after last change (default: 2000) */
  delay?: number;
  /** Max age in ms before draft is considered stale (default: 24 hours) */
  maxAge?: number;
}

/** State required from the store for autosave */
interface AutosaveState {
  fieldValues: Record<string, unknown>;
  selectedModelId: string | null;
  activeTab?: string;
}

/** Actions required from the store for autosave */
interface AutosaveActions {
  /** Load draft values into the store */
  loadDraft?: (values: Record<string, unknown>) => void;
  /** Alternative: update multiple fields at once */
  updateFields?: (values: Record<string, unknown>) => void;
}

/** Stored draft structure */
interface StoredDraft {
  fieldValues: Record<string, unknown>;
  selectedModelId: string | null;
  activeTab?: string;
  timestamp: number;
}

const DEFAULT_DELAY = 2000; // 2 seconds
const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Creates an autosave hook for a specific store
 * 
 * @example
 * // In your component:
 * const { useAutosave, clearDraft, hasDraft } = createAutosave({
 *   storageKey: "my-app-draft",
 *   delay: 2000,
 * });
 * 
 * // Then in component:
 * useAutosave(store.fieldValues, store.selectedModelId, store.loadDraft);
 */
export function createAutosave(config: AutosaveConfig) {
  const { 
    storageKey, 
    delay = DEFAULT_DELAY, 
    maxAge = DEFAULT_MAX_AGE 
  } = config;

  /**
   * Hook to enable autosave functionality
   * Saves field values to localStorage after user stops typing
   */
  function useAutosave(
    state: AutosaveState,
    loadDraft: (values: Record<string, unknown>) => void
  ) {
    const { fieldValues, selectedModelId, activeTab } = state;

    // Save to localStorage after delay
    useEffect(() => {
      if (!selectedModelId) {
        return;
      }

      const timer = setTimeout(() => {
        try {
          const draft: StoredDraft = {
            fieldValues,
            selectedModelId,
            activeTab,
            timestamp: Date.now(),
          };
          localStorage.setItem(storageKey, JSON.stringify(draft));
        } catch (error) {
          console.error(`[${storageKey}] Failed to save draft:`, error);
        }
      }, delay);

      return () => clearTimeout(timer);
    }, [fieldValues, selectedModelId, activeTab]);

    // Load from localStorage on mount
    useEffect(() => {
      try {
        const savedDraft = localStorage.getItem(storageKey);
        if (savedDraft) {
          const draft: StoredDraft = JSON.parse(savedDraft);

          // Check if draft is not too old
          const isRecent = Date.now() - draft.timestamp < maxAge;

          if (isRecent && draft.fieldValues) {
            loadDraft(draft.fieldValues);
          }
        }
      } catch (error) {
        console.error(`[${storageKey}] Failed to load draft:`, error);
      }
    }, [loadDraft]);
  }

  /**
   * Clear saved draft from localStorage
   */
  function clearDraft(): void {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`[${storageKey}] Failed to clear draft:`, error);
    }
  }

  /**
   * Check if a draft exists in localStorage
   */
  function hasDraft(): boolean {
    try {
      const draft = localStorage.getItem(storageKey);
      if (!draft) return false;

      const parsed: StoredDraft = JSON.parse(draft);
      const isRecent = Date.now() - parsed.timestamp < maxAge;
      return isRecent;
    } catch {
      return false;
    }
  }

  /**
   * Get the stored draft without loading it
   */
  function getDraft(): StoredDraft | null {
    try {
      const draft = localStorage.getItem(storageKey);
      if (!draft) return null;

      const parsed: StoredDraft = JSON.parse(draft);
      const isRecent = Date.now() - parsed.timestamp < maxAge;
      return isRecent ? parsed : null;
    } catch {
      return null;
    }
  }

  return {
    useAutosave,
    clearDraft,
    hasDraft,
    getDraft,
  };
}

// Pre-configured instances for each generator
export const imageAutosave = createAutosave({
  storageKey: "image-gen-draft",
});

export const videoAutosave = createAutosave({
  storageKey: "video-gen-draft",
});




