/**
 * Parameter Builder Service
 * 
 * Collects form parameters from Zustand store, uploads files to Cloudinary,
 * and builds a clean, type-safe parameter object for the API
 */

import { Model, ModelSettings } from "../lib/modelRegistry";
import { ActiveTab } from "../store/useImageGenerationStore";
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  extractCloudinaryUrl,
  extractCloudinaryUrls,
} from "./cloudinary";
import { isFile, isFileArray } from "../types/api.types";
import { getFieldMetadata } from "./fieldMetadata";

/**
 * Field name mappings for API normalization
 */
const LEGACY_FIELD_NAME_MAP: Record<string, string> = {
  quantity: "num_images",
  output_quality: "quality",
};

/**
 * Get the standard field name (maps aliases to standard names)
 */
function resolveBackendKey(fieldName: string, fieldConfig?: Record<string, any>): string {
  const metadata = getFieldMetadata(fieldName);
  if (fieldConfig?.backendKey) {
    return fieldConfig.backendKey;
  }
  if (metadata?.backendKey) {
    return metadata.backendKey;
  }
  return LEGACY_FIELD_NAME_MAP[fieldName] || fieldName;
}

/**
 * Check if a field is a file field based on model settings or field name
 */
function isFileField(fieldName: string, config: any): boolean {
  const metadata = getFieldMetadata(fieldName);
  if (metadata?.kind === "file-array" || metadata?.kind === "file-single") {
    return true;
  }

  // Check common file field names first (works even without config)
  const fileFieldNames = ["reference_images", "original_image", "image_urls", "uploaded_images"];

  if (fileFieldNames.includes(fieldName)) {
    return true;
  }

  // If no config, can't determine from settings
  if (!config) return false;

  // Check if it's explicitly marked as a file type
  if (config.type === "array" && config.max_files !== undefined) {
    return true; // Multiple file upload
  }

  return false;
}

/**
 * Upload file fields to Cloudinary and replace with URLs
 */
async function processFileFields(
  fieldValues: Record<string, any>,
  settings: ModelSettings
): Promise<Record<string, any>> {
  const processedValues: Record<string, any> = { ...fieldValues };
  
  // Process each field
  for (const [fieldName, value] of Object.entries(fieldValues)) {
    const config = settings[fieldName];

    // Skip if not a file field
    if (!isFileField(fieldName, config)) {
      continue;
    }

    // Skip if value is null, undefined, or empty array
    if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
      continue;
    }

    // Handle single file
    if (isFile(value)) {
      try {
        const uploadResponse = await uploadToCloudinary(value);
        const url = extractCloudinaryUrl(uploadResponse);

        processedValues[fieldName] = url;
      } catch (error) {
        console.error(`Failed to upload ${fieldName}:`, error);
        throw new Error(`Failed to upload ${fieldName}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
    // Handle multiple files
    else if (isFileArray(value)) {
      try {
        const uploadResponses = await uploadMultipleToCloudinary(value);
        const urls = extractCloudinaryUrls(uploadResponses);

        processedValues[fieldName] = urls;
      } catch (error) {
        console.error(`Failed to upload ${fieldName}:`, error);
        throw new Error(`Failed to upload ${fieldName}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }

  return processedValues;
}

/**
 * Normalize field names to API format
 */
function normalizeFieldNames(
  fieldValues: Record<string, any>,
  settings: ModelSettings
): Record<string, any> {
  const normalized: Record<string, any> = {};

  for (const [fieldName, value] of Object.entries(fieldValues)) {
    const backendKey = resolveBackendKey(fieldName, settings[fieldName]);
    normalized[backendKey] = value;
  }

  return normalized;
}

/**
 * Filter out undefined/null values and clean up the object
 */
function cleanParameters(params: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(params)) {
    // Skip undefined, null, and empty strings (unless it's a valid empty array)
    if (value === undefined || value === null || value === "") {
      continue;
    }
    
    // Keep empty arrays (they might be valid)
    if (Array.isArray(value) && value.length === 0) {
      continue; // Skip empty arrays
    }
    
    cleaned[key] = value;
  }
  
  return cleaned;
}

/**
 * Apply default values from model settings for undefined fields
 */
function applySettingDefaults(
  fieldValues: Record<string, any>,
  settings: ModelSettings
): Record<string, any> {
  const valuesWithDefaults = { ...fieldValues };

  Object.entries(settings).forEach(([fieldName, config]) => {
    if (!config || typeof config !== "object") {
      return;
    }

    const metadata = getFieldMetadata(fieldName);

    const hasValue =
      valuesWithDefaults[fieldName] !== undefined &&
      valuesWithDefaults[fieldName] !== null;

    if (hasValue) {
      return;
    }

    if (config.default !== undefined) {
      valuesWithDefaults[fieldName] = config.default;
      return;
    }

    if (metadata?.defaultValue !== undefined) {
      valuesWithDefaults[fieldName] = metadata.defaultValue;
      return;
    }

    if (config.options && Array.isArray(config.options) && config.options.length > 0) {
      const firstOption = config.options[0];
      if (typeof firstOption === "string") {
        valuesWithDefaults[fieldName] = firstOption;
      } else if (typeof firstOption === "object" && firstOption.value) {
        valuesWithDefaults[fieldName] = firstOption.value;
      }
    }
  });

  return valuesWithDefaults;
}

/**
 * Build generation parameters from field values
 * 
 * @param model - Selected model configuration
 * @param fieldValues - All field values from Zustand store
 * @param activeTab - Active tab type
 * @returns Clean parameter object ready for API
 */
export async function buildGenerationParams(
  model: Model,
  fieldValues: Record<string, any>,
  activeTab: ActiveTab
): Promise<Record<string, any>> {
  const settings = model.settings || {};

  // Step 0: Apply defaults from settings for missing values
  const valuesWithDefaults = applySettingDefaults(fieldValues, settings);

  // Step 1: Upload file fields to Cloudinary and replace with URLs
  const processedValues = await processFileFields(valuesWithDefaults, settings);
  
  // Step 2: Normalize field names (quantity → num_images, etc.)
  const normalizedValues = normalizeFieldNames(processedValues, settings);
  
  // Step 3: Clean up undefined/null/empty values
  const cleanedParams = cleanParameters(normalizedValues);

  return cleanedParams;
}

/**
 * Get required fields for a specific tab
 */
export function getRequiredFieldsForTab(
  activeTab: ActiveTab,
  settings: ModelSettings
): string[] {
  const requiredFields: string[] = [];
  
  if (activeTab === "text-to-image") {
    requiredFields.push("prompt");
  } else if (activeTab === "image-reference") {
    requiredFields.push("prompt", "reference_images");
  } else if (activeTab === "restyle") {
    requiredFields.push("style_prompt", "original_image");
  }
  
  // Add model-specific required fields
  Object.entries(settings).forEach(([fieldName, config]) => {
    if (config && typeof config === "object" && config.required === true) {
      if (!requiredFields.includes(fieldName)) {
        requiredFields.push(fieldName);
      }
    }
  });
  
  return requiredFields;
}

