/**
 * Zustand Store for Video Generation
 * Centralizes all state management with persistence
 * Eliminates prop drilling across components
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ModelType } from "../types/index.types";
import { getDefaultFieldValues } from "../utils/costCalculator";
import {
  createAddToRecentUpdater,
  createToggleFavoriteUpdater,
  formatFieldName,
} from "@/lib/store/storeUtils";

/**
 * Video generation result
 */
export interface VideoResult {
  id: string;
  url: string;
  thumbnail?: string;
  createdAt: Date;
  model: string;
  cost: number;
}

/**
 * Complete Zustand store interface
 */
export interface GenerationStore {
  // ============================================================
  // MODEL SELECTION
  // ============================================================
  
  /** Active tab: text, image, or video */
  activeTab: "text" | "image" | "video";
  
  /** Currently selected model ID */
  selectedModelId: string | null;
  
  /** Currently selected model object */
  selectedModel: ModelType | null;
  
  /** Set active tab and filter models */
  setActiveTab: (tab: "text" | "image" | "video") => void;
  
  /** Set selected model and initialize field values */
  setModel: (model: ModelType) => void;
  
  // ============================================================
  // FIELD VALUES
  // ============================================================
  
  /** All field values indexed by field name */
  fieldValues: Record<string, any>;
  
  /** Update a single field value */
  updateField: (fieldName: string, value: any) => void;
  
  /** Update multiple fields at once */
  updateFields: (fields: Record<string, any>) => void;
  
  /** Reset all fields to defaults */
  resetFields: () => void;
  
  /** Load draft from localStorage */
  loadDraft: (draft: Record<string, any>) => void;
  
  /** Get field value with type safety */
  getFieldValue: <T = any>(fieldName: string, defaultValue?: T) => T;
  
  // ============================================================
  // VALIDATION
  // ============================================================
  
  /** Field errors indexed by field name */
  fieldErrors: Record<string, string>;
  
  /** Validate a single field */
  validateField: (fieldName: string) => boolean;
  
  /** Validate all required fields */
  validateAll: () => boolean;
  
  /** Clear validation errors */
  clearErrors: () => void;
  
  /** Set field error */
  setFieldError: (fieldName: string, error: string) => void;
  
  // ============================================================
  // GENERATION
  // ============================================================
  
  /** Is currently generating video */
  isGenerating: boolean;
  
  /** Generation progress (0-100) */
  progress: number;
  
  /** Generated video results */
  results: VideoResult[];
  
  /** Start video generation */
  startGeneration: () => Promise<void>;
  
  /** Cancel ongoing generation */
  cancelGeneration: () => void;
  
  /** Clear all results */
  clearResults: () => void;
  
  // ============================================================
  // UI STATE
  // ============================================================
  
  /** Recently used model IDs (max 10) */
  recentModels: string[];
  
  /** Favorite model IDs */
  favoriteModels: string[];
  
  /** Add model to recent list */
  addToRecent: (modelId: string) => void;
  
  /** Toggle model favorite status */
  toggleFavorite: (modelId: string) => void;
}

/**
 * Create the Zustand store with persistence
 */
export const useGenerationStore = create<GenerationStore>()(
  persist(
    (set, get) => ({
      // ============================================================
      // INITIAL STATE
      // ============================================================
      
      activeTab: "text",
      selectedModelId: null,
      selectedModel: null,
      fieldValues: {},
      fieldErrors: {},
      isGenerating: false,
      progress: 0,
      results: [],
      recentModels: [],
      favoriteModels: [],
      
      // ============================================================
      // MODEL SELECTION ACTIONS
      // ============================================================
      
      setActiveTab: (tab) => {
        // Only update the tab - let the page component handle model selection
        // This prevents double-render where we first show "no model" then "model selected"
        // The useEffect in page.tsx auto-selects the first model for the new tab
        set({ 
          activeTab: tab,
          // Clear errors but preserve other state for smoother transitions
          fieldErrors: {},
        });
      },
      
      setModel: (model) => {
        // Get default field values from model
        const defaults = getDefaultFieldValues(model);
        
        set({
          selectedModelId: model.id,
          selectedModel: model,
          fieldValues: defaults,
          fieldErrors: {},
        });
        
        // Add to recent models
        get().addToRecent(model.id);
      },
      
      // ============================================================
      // FIELD VALUE ACTIONS
      // ============================================================
      
      updateField: (fieldName, value) => {
        set((state) => {
          const newValues = { ...state.fieldValues, [fieldName]: value };
          
          // Validate field
          const error = validateFieldValue(
            fieldName,
            value,
            state.selectedModel
          );
          
          const newErrors = { ...state.fieldErrors };
          if (error) {
            newErrors[fieldName] = error;
          } else {
            delete newErrors[fieldName];
          }
          
          return {
            fieldValues: newValues,
            fieldErrors: newErrors,
          };
        });
      },
      
      updateFields: (fields) => {
        set((state) => {
          const newValues = { ...state.fieldValues, ...fields };
          
          return {
            fieldValues: newValues,
          };
        });
      },
      
      resetFields: () => {
        const { selectedModel } = get();
        if (selectedModel) {
          const defaults = getDefaultFieldValues(selectedModel);
          set({
            fieldValues: defaults,
            fieldErrors: {},
          });
        }
      },
      
      loadDraft: (draft) => {
        set((state) => {
          const newValues = { ...state.fieldValues, ...draft };
          
          return {
            fieldValues: newValues,
          };
        });
      },
      
      getFieldValue: (fieldName, defaultValue) => {
        const { fieldValues } = get();
        return fieldValues[fieldName] ?? defaultValue;
      },
      
      // ============================================================
      // VALIDATION ACTIONS
      // ============================================================
      
      validateField: (fieldName) => {
        const { fieldValues, selectedModel } = get();
        const value = fieldValues[fieldName];
        const error = validateFieldValue(fieldName, value, selectedModel);
        
        if (error) {
          set((state) => ({
            fieldErrors: { ...state.fieldErrors, [fieldName]: error },
          }));
          return false;
        }
        
        set((state) => {
          const newErrors = { ...state.fieldErrors };
          delete newErrors[fieldName];
          return { fieldErrors: newErrors };
        });
        
        return true;
      },
      
      validateAll: () => {
        const { fieldValues, selectedModel } = get();
        
        if (!selectedModel) {
          return false;
        }
        
        const errors: Record<string, string> = {};
        let hasErrors = false;
        
        // Validate each field that the model expects
        for (const fieldName of selectedModel.fields) {
          const value = fieldValues[fieldName];
          const error = validateFieldValue(fieldName, value, selectedModel);
          
          if (error) {
            errors[fieldName] = error;
            hasErrors = true;
          }
        }
        
        set({ fieldErrors: errors });
        return !hasErrors;
      },
      
      clearErrors: () => {
        set({ fieldErrors: {} });
      },
      
      setFieldError: (fieldName, error) => {
        set((state) => ({
          fieldErrors: { ...state.fieldErrors, [fieldName]: error },
        }));
      },
      
      // ============================================================
      // GENERATION ACTIONS
      // ============================================================
      
      startGeneration: async () => {
        const { validateAll, fieldValues, selectedModel } = get();
        
        // Validate all fields
        if (!validateAll()) {
          throw new Error("Please fix validation errors before generating");
        }
        
        if (!selectedModel) {
          throw new Error("No model selected");
        }
        
        set({ isGenerating: true, progress: 0 });
        
        try {
          // TODO: Replace with actual API call
          // Simulate generation progress
          for (let i = 0; i <= 100; i += 10) {
            set({ progress: i });
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          
          // Create mock result
          const result: VideoResult = {
            id: `video-${Date.now()}`,
            url: "https://via.placeholder.com/800x450/000000/FFFFFF/?text=Generated+Video",
            thumbnail: "https://via.placeholder.com/200x113",
            createdAt: new Date(),
            model: selectedModel.id,
            cost: 0,
          };
          
          set((state) => ({
            results: [...state.results, result],
            isGenerating: false,
            progress: 100,
          }));
        } catch (error) {
          set({ isGenerating: false, progress: 0 });
          throw error;
        }
      },
      
      cancelGeneration: () => {
        // TODO: Implement actual cancellation
        set({ isGenerating: false, progress: 0 });
      },
      
      clearResults: () => {
        set({ results: [] });
      },
      
      // ============================================================
      // UI STATE ACTIONS
      // ============================================================
      
      addToRecent: (modelId) => {
        set((state) => createAddToRecentUpdater(modelId, state.recentModels));
      },
      
      toggleFavorite: (modelId) => {
        set((state) => createToggleFavoriteUpdater(modelId, state.favoriteModels));
      },
    }),
    {
      name: "video-gen-storage",
      // Only persist these fields
      partialize: (state) => ({
        recentModels: state.recentModels,
        favoriteModels: state.favoriteModels,
        fieldValues: state.fieldValues,
        selectedModelId: state.selectedModelId,
        activeTab: state.activeTab,
      }),
    }
  )
);

/**
 * Validate a field value
 * Returns error message or null if valid
 */
function validateFieldValue(
  fieldName: string,
  value: any,
  model: ModelType | null
): string | null {
  if (!model) {
    return null;
  }
  
  // Check if field is required
  if (!value || (typeof value === "string" && !value.trim())) {
    // Prompt is always required
    if (fieldName === "prompt") {
      return "Prompt is required";
    }
    // Other fields might be required by model
    if (model.fields.includes(fieldName)) {
      const fieldOption = model.fieldOptions?.[fieldName];
      if (fieldOption?.userSelectable !== false) {
        // Check for file uploads
        if (fieldName.includes("image") || fieldName.includes("video")) {
          return `${formatFieldName(fieldName)} is required`;
        }
      }
    }
  }
  
  // Check prompt length
  if (fieldName === "prompt" && typeof value === "string") {
    const maxLength = model.capabilities?.promptCharacterLimit || 1500;
    if (value.length > maxLength) {
      return `Prompt must be ${maxLength} characters or less`;
    }
    if (value.length < 3) {
      return "Prompt must be at least 3 characters";
    }
  }
  
  // Check negative prompt length
  if (fieldName === "negativePrompt" && typeof value === "string") {
    const maxLength = model.capabilities?.negativePromptCharacterLimit || 1500;
    if (value.length > maxLength) {
      return `Negative prompt must be ${maxLength} characters or less`;
    }
  }
  
  return null;
}

// formatFieldName is now imported from @/lib/store/storeUtils

