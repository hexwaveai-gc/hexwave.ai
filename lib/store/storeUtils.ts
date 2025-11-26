/**
 * Shared Store Utilities
 * 
 * Common utilities for Zustand stores used across image and video generators.
 * Extracted to eliminate code duplication between stores.
 * 
 * Reasoning: Both image-generator and ai-video-generator had identical
 * implementations of addToRecent, toggleFavorite, and formatFieldName.
 */

/** Maximum number of recent models to keep */
const MAX_RECENT_MODELS = 10;

/**
 * Creates an updater function for adding a model to recent list
 * 
 * @example
 * // In Zustand store:
 * addToRecent: (modelId) => {
 *   set((state) => createAddToRecentUpdater(modelId, state.recentModels));
 * }
 */
export function createAddToRecentUpdater(
  modelId: string,
  currentRecent: string[]
): { recentModels: string[] } {
  // Remove if already exists
  const filtered = currentRecent.filter((id) => id !== modelId);
  // Add to front, keep max items
  const newRecent = [modelId, ...filtered].slice(0, MAX_RECENT_MODELS);
  return { recentModels: newRecent };
}

/**
 * Creates an updater function for toggling model favorite status
 * 
 * @example
 * // In Zustand store:
 * toggleFavorite: (modelId) => {
 *   set((state) => createToggleFavoriteUpdater(modelId, state.favoriteModels));
 * }
 */
export function createToggleFavoriteUpdater(
  modelId: string,
  currentFavorites: string[]
): { favoriteModels: string[] } {
  const isFavorite = currentFavorites.includes(modelId);
  const newFavorites = isFavorite
    ? currentFavorites.filter((id) => id !== modelId)
    : [...currentFavorites, modelId];
  return { favoriteModels: newFavorites };
}

/**
 * Format field name to human-readable text
 * Converts camelCase and snake_case to Title Case
 * 
 * @example
 * formatFieldName("startImage") // "Start Image"
 * formatFieldName("aspect_ratio") // "Aspect Ratio"
 * formatFieldName("negativePrompt") // "Negative Prompt"
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    // Insert space before capital letters (camelCase)
    .replace(/([A-Z])/g, " $1")
    // Replace underscores with spaces (snake_case)
    .replace(/_/g, " ")
    // Split and capitalize each word
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

/**
 * Creates field value updater with validation
 * Returns new state with updated values and errors
 */
export function createFieldValueUpdater<T extends Record<string, unknown>>(
  fieldName: string,
  value: unknown,
  currentValues: T,
  currentErrors: Record<string, string>,
  validate?: (fieldName: string, value: unknown) => string | null
): { fieldValues: T; fieldErrors: Record<string, string> } {
  const newValues = { ...currentValues, [fieldName]: value } as T;

  const newErrors = { ...currentErrors };
  if (validate) {
    const error = validate(fieldName, value);
    if (error) {
      newErrors[fieldName] = error;
    } else {
      delete newErrors[fieldName];
    }
  }

  return {
    fieldValues: newValues,
    fieldErrors: newErrors,
  };
}

/**
 * Type helper for store state with common fields
 */
export interface CommonStoreState {
  recentModels: string[];
  favoriteModels: string[];
  fieldValues: Record<string, unknown>;
  fieldErrors: Record<string, string>;
}

/**
 * Type helper for store actions using these utilities
 */
export interface CommonStoreActions {
  addToRecent: (modelId: string) => void;
  toggleFavorite: (modelId: string) => void;
  updateField: (fieldName: string, value: unknown) => void;
  updateFields: (fields: Record<string, unknown>) => void;
}




