/**
 * Autosave Hook
 * Automatically saves form state to localStorage
 * Restores state on page load
 * 
 * Note: The Zustand store already has persistence middleware,
 * but this hook provides additional draft restoration functionality
 */

import { useEffect } from "react";
import { useImageGenerationStore } from "../store/useImageGenerationStore";

const AUTOSAVE_KEY = "image-gen-draft";
const AUTOSAVE_DELAY = 2000; // 2 seconds after last change

/**
 * Hook to enable autosave functionality
 * Saves field values to localStorage after user stops typing
 */
export function useAutosave() {
  const fieldValues = useImageGenerationStore((s) => s.fieldValues);
  const selectedModelId = useImageGenerationStore((s) => s.selectedModelId);
  const activeTab = useImageGenerationStore((s) => s.activeTab);
  const updateFields = useImageGenerationStore((s) => s.updateFields);
  
  // Save to localStorage after delay
  useEffect(() => {
    if (!selectedModelId) {
      return;
    }
    
    const timer = setTimeout(() => {
      try {
        const draft = {
          fieldValues,
          selectedModelId,
          activeTab,
          timestamp: Date.now(),
        };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
        console.log("Draft saved");
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
    }, AUTOSAVE_DELAY);
    
    return () => clearTimeout(timer);
  }, [fieldValues, selectedModelId, activeTab]);
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        
        // Check if draft is not too old (24 hours)
        const isRecent = Date.now() - draft.timestamp < 24 * 60 * 60 * 1000;
        
        if (isRecent && draft.fieldValues) {
          updateFields(draft.fieldValues);
          console.log("Draft restored");
        }
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
    }
  }, [updateFields]);
}

/**
 * Clear saved draft
 */
export function clearAutosavedDraft() {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch (error) {
    console.error("Failed to clear draft:", error);
  }
}

/**
 * Check if draft exists
 */
export function hasAutosavedDraft(): boolean {
  try {
    const draft = localStorage.getItem(AUTOSAVE_KEY);
    return !!draft;
  } catch {
    return false;
  }
}

