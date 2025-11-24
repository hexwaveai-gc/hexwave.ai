/**
 * Zustand Store for Image Generation
 * Centralizes all state management with persistence
 * Eliminates prop drilling across components
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Model, getModelById } from "../lib/modelRegistry";

/**
 * Image generation result
 */
export interface ImageResult {
  id: string;
  url: string;
  createdAt: Date;
  model: string;
}

/**
 * Active tab type
 */
export type ActiveTab = "text-to-image" | "image-reference" | "restyle";

/**
 * Complete Zustand store interface for Image Generation
 */
export interface ImageGenerationStore {
  // ============================================================
  // TAB MANAGEMENT
  // ============================================================
  
  /** Active tab: text-to-image, image-reference, or restyle */
  activeTab: ActiveTab;
  
  /** Set active tab and reset tab-specific state */
  setActiveTab: (tab: ActiveTab) => void;
  
  // ============================================================
  // MODEL SELECTION
  // ============================================================
  
  /** Currently selected model ID */
  selectedModelId: string | null;
  
  /** Currently selected model object */
  selectedModel: Model | null;
  
  /** Set selected model and initialize field values */
  setModel: (modelId: string) => void;
  
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
  
  /** Get field value with type safety */
  getFieldValue: <T = any>(fieldName: string, defaultValue?: T) => T;
  
  // ============================================================
  // TAB-SPECIFIC STATE
  // ============================================================
  
  /** Hints index for text-to-image tab */
  hintsIndex: number;
  
  /** Set hints index */
  setHintsIndex: (index: number) => void;
  
  // ============================================================
  // VALIDATION
  // ============================================================
  
  /** Field errors indexed by field name */
  fieldErrors: Record<string, string>;
  
  /** Validate a single field */
  validateField: (fieldName: string) => boolean;
  
  /** Validate all required fields for current tab */
  validateAll: () => boolean;
  
  /** Clear validation errors */
  clearErrors: () => void;
  
  /** Set field error */
  setFieldError: (fieldName: string, error: string) => void;
  
  // ============================================================
  // GENERATION
  // ============================================================
  
  /** Is currently generating image */
  isGenerating: boolean;
  
  /** Generated image results */
  generatedImages: string[];
  
  /** Currently maximized image URL */
  maximizedImage: string | null;
  
  /** Start image generation */
  startGeneration: () => Promise<void>;
  
  /** Set maximized image */
  setMaximizedImage: (url: string | null) => void;
  
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
 * Get default field values based on model settings
 */
function getDefaultFieldValues(model: Model): Record<string, any> {
  const defaults: Record<string, any> = {};
  const settings = model.settings || {};
  
  // Extract defaults from model settings
  Object.entries(settings).forEach(([key, config]) => {
    if (config && typeof config === "object" && "default" in config) {
      defaults[key] = config.default;
    }
  });
  
  return defaults;
}

/**
 * Validate field value based on active tab and model
 */
function validateFieldValue(
  fieldName: string,
  value: any,
  activeTab: ActiveTab,
  model: Model | null
): string | null {
  if (!model) {
    return null;
  }
  
  const settings = model.settings || {};
  const fieldConfig = settings[fieldName];
  
  // Check required fields based on tab
  if (activeTab === "text-to-image") {
    if (fieldName === "prompt") {
      if (!value || (typeof value === "string" && !value.trim())) {
        return "Prompt is required";
      }
    }
  } else if (activeTab === "image-reference") {
    if (fieldName === "prompt") {
      if (!value || (typeof value === "string" && !value.trim())) {
        return "Prompt is required";
      }
    }
    if (fieldName === "reference_images") {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return "At least one reference image is required";
      }
      // Check max files
      const maxFiles = fieldConfig?.max_files || 3;
      if (Array.isArray(value) && value.length > maxFiles) {
        return `Maximum ${maxFiles} images allowed`;
      }
    }
  } else if (activeTab === "restyle") {
    if (fieldName === "style_prompt") {
      if (!value || (typeof value === "string" && !value.trim())) {
        return "Style prompt is required";
      }
    }
    if (fieldName === "original_image") {
      if (!value) {
        return "Original image is required";
      }
    }
  }
  
  // Validate file size if it's a file field
  if (value instanceof File) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (value.size > maxSize) {
      return "File size must be under 10MB";
    }
  }
  
  // Validate array of files
  if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (const file of value) {
      if (file.size > maxSize) {
        return "All files must be under 10MB";
      }
    }
  }
  
  return null;
}

/**
 * Create the Zustand store with persistence
 */
export const useImageGenerationStore = create<ImageGenerationStore>()(
  persist(
    (set, get) => ({
      // ============================================================
      // INITIAL STATE
      // ============================================================
      
      activeTab: "text-to-image",
      selectedModelId: null,
      selectedModel: null,
      fieldValues: {},
      fieldErrors: {},
      hintsIndex: 0,
      isGenerating: false,
      generatedImages: [],
      maximizedImage: null,
      recentModels: [],
      favoriteModels: [],
      
      // ============================================================
      // TAB MANAGEMENT ACTIONS
      // ============================================================
      
      setActiveTab: (tab) => {
        set({
          activeTab: tab,
          // Reset field values and errors when switching tabs
          fieldValues: {},
          fieldErrors: {},
        });
      },
      
      // ============================================================
      // MODEL SELECTION ACTIONS
      // ============================================================
      
      setModel: (modelId) => {
        const model = getModelById(modelId);
        if (!model) {
          console.warn(`Model not found: ${modelId}`);
          return;
        }
        
        // Get default field values from model
        const defaults = getDefaultFieldValues(model);
        
        set({
          selectedModelId: modelId,
          selectedModel: model,
          fieldValues: defaults,
          fieldErrors: {},
        });
        
        // Add to recent models
        get().addToRecent(modelId);
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
            state.activeTab,
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
      
      getFieldValue: (fieldName, defaultValue) => {
        const { fieldValues } = get();
        return fieldValues[fieldName] ?? defaultValue;
      },
      
      // ============================================================
      // TAB-SPECIFIC ACTIONS
      // ============================================================
      
      setHintsIndex: (index) => {
        set({ hintsIndex: index });
      },
      
      // ============================================================
      // VALIDATION ACTIONS
      // ============================================================
      
      validateField: (fieldName) => {
        const { fieldValues, activeTab, selectedModel } = get();
        const value = fieldValues[fieldName];
        const error = validateFieldValue(fieldName, value, activeTab, selectedModel);
        
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
        const { fieldValues, activeTab, selectedModel } = get();
        
        if (!selectedModel) {
          return false;
        }
        
        const errors: Record<string, string> = {};
        let hasErrors = false;
        
        // Validate based on active tab
        if (activeTab === "text-to-image") {
          // Required: prompt
          if (!fieldValues.prompt || (typeof fieldValues.prompt === "string" && !fieldValues.prompt.trim())) {
            errors.prompt = "Prompt is required";
            hasErrors = true;
          }
        } else if (activeTab === "image-reference") {
          // Required: prompt, reference_images
          if (!fieldValues.prompt || (typeof fieldValues.prompt === "string" && !fieldValues.prompt.trim())) {
            errors.prompt = "Prompt is required";
            hasErrors = true;
          }
          if (!fieldValues.reference_images || (Array.isArray(fieldValues.reference_images) && fieldValues.reference_images.length === 0)) {
            errors.reference_images = "At least one reference image is required";
            hasErrors = true;
          }
        } else if (activeTab === "restyle") {
          // Required: style_prompt, original_image
          if (!fieldValues.style_prompt || (typeof fieldValues.style_prompt === "string" && !fieldValues.style_prompt.trim())) {
            errors.style_prompt = "Style prompt is required";
            hasErrors = true;
          }
          if (!fieldValues.original_image) {
            errors.original_image = "Original image is required";
            hasErrors = true;
          }
        }
        
        // Validate all fields that have values
        Object.entries(fieldValues).forEach(([fieldName, value]) => {
          const error = validateFieldValue(fieldName, value, activeTab, selectedModel);
          if (error) {
            errors[fieldName] = error;
            hasErrors = true;
          }
        });
        
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
        const { validateAll, fieldValues, selectedModel, activeTab } = get();
        
        // Validate all fields
        if (!validateAll()) {
          throw new Error("Please fix validation errors before generating");
        }
        
        if (!selectedModel) {
          throw new Error("No model selected");
        }
        
        set({ isGenerating: true });
        
        try {
          // Import API service dynamically to avoid circular dependencies
          const { generateImage } = await import("../lib/api/imageGenerationApi");
          
          // Call API service
          const response = await generateImage(selectedModel, fieldValues, activeTab);
          
          if (!response.success) {
            throw new Error(response.error || "Image generation failed");
          }
          
          // Update generated images with response
          set((state) => ({
            generatedImages: [...state.generatedImages, ...response.images],
            isGenerating: false,
          }));
        } catch (error) {
          set({ isGenerating: false });
          
          // Set error message in store
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          set((state) => ({
            fieldErrors: {
              ...state.fieldErrors,
              _general: errorMessage,
            },
          }));
          
          throw error;
        }
      },
      
      setMaximizedImage: (url) => {
        set({ maximizedImage: url });
      },
      
      clearResults: () => {
        set({ generatedImages: [], maximizedImage: null });
      },
      
      // ============================================================
      // UI STATE ACTIONS
      // ============================================================
      
      addToRecent: (modelId) => {
        set((state) => {
          // Remove if already exists
          const filtered = state.recentModels.filter((id) => id !== modelId);
          // Add to front, keep max 10
          const newRecent = [modelId, ...filtered].slice(0, 10);
          return { recentModels: newRecent };
        });
      },
      
      toggleFavorite: (modelId) => {
        set((state) => {
          const isFavorite = state.favoriteModels.includes(modelId);
          const newFavorites = isFavorite
            ? state.favoriteModels.filter((id) => id !== modelId)
            : [...state.favoriteModels, modelId];
          return { favoriteModels: newFavorites };
        });
      },
    }),
    {
      name: "image-gen-storage",
      // Only persist these fields
      partialize: (state) => ({
        recentModels: state.recentModels,
        favoriteModels: state.favoriteModels,
        fieldValues: state.fieldValues,
        selectedModelId: state.selectedModelId,
        activeTab: state.activeTab,
        hintsIndex: state.hintsIndex,
      }),
    }
  )
);

