/**
 * Complete Field Type System for Dynamic Video Model UI
 * Covers all field types used across 76+ video models
 */

import { ModelType } from "./index.types";
import { ModelCapabilities } from "./enhanced-model.types";

/**
 * Core field types covering ALL 76 models
 * Each type corresponds to a specific UI component and behavior
 */
export type FieldType =
  | "textarea"           // prompt, negativePrompt - multiline text with character counter
  | "select"             // duration, aspectRatio, resolution, pixverseStyles - dropdown selection
  | "toggle"             // enhancePrompt, loop, cameraFixed - boolean switch
  | "slider"             // movementAmplitude, shift, seed - numeric slider with visual feedback
  | "file-single"        // imageBase64, videoBase64, endFrameImageBase64 - single file upload with preview
  | "file-multiple"      // referenceImageUrls, scenesImages - multiple file uploads with reordering
  | "url-array"          // tail_image_url - URL input (different from base64 file upload)
  | "template-select"    // Vidu template with tier categories - special grouped select
  | "number";            // seed alternative - numeric input with validation

/**
 * Validation rules for field values
 */
export interface ValidationRules {
  minLength?: number;
  maxLength?: number | ((model: ModelType) => number);
  min?: number;
  max?: number;
  required?: boolean;
  pattern?: RegExp;
  custom?: (value: any, model: ModelType) => string | null;
  maxDuration?: number;  // For video uploads (in seconds)
}

/**
 * Conditional rendering logic
 * Determines when a field should be visible/enabled based on model capabilities
 */
export interface ConditionalLogic {
  /**
   * Function to determine if field should be shown
   * @example showIf: (model) => !model.capabilities?.fixedDuration
   */
  showIf?: (model: ModelType) => boolean;
  
  /**
   * Other field names this field depends on
   * Field will re-render when these fields change
   */
  dependsOn?: string[];
  
  /**
   * Required capability for this field to be shown
   * @example requiresCapability: "supportsEndFrame"
   */
  requiresCapability?: keyof ModelCapabilities;
}

/**
 * Complete field metadata with all properties from actual models
 * This is the central configuration for each field type
 */
export interface FieldMetadata {
  /** Field type determines which component to render */
  type: FieldType;
  
  /** Component name to render (maps to FIELD_COMPONENTS registry) */
  component: string;
  
  /** Display label shown above the field */
  label?: string;
  
  /** Help text shown below the field */
  helpText?: string;
  
  /** Placeholder text for inputs */
  placeholder?: string;
  
  /** File input configurations */
  accept?: string;                  // MIME types: "image/*", "video/*"
  maxFiles?: number;                // Maximum number of files for multi-file uploads
  minFiles?: number;                // Minimum number of files required
  preview?: boolean;                // Show preview thumbnails for uploaded files
  uploadToCloud?: boolean;          // Upload to temp storage and return URLs (for referenceImageUrls)
  reorderable?: boolean;            // Allow drag-to-reorder for multi-file uploads (scenesImages)
  
  /** Image-specific validations */
  dimensionValidation?: {
    minAspectRatio?: number;       // Minimum aspect ratio (width/height)
    maxAspectRatio?: number;       // Maximum aspect ratio
    minWidth?: number;             // Minimum width in pixels
    minHeight?: number;            // Minimum height in pixels
  };
  
  /** File size constraints */
  sizeLimit?: number;               // Max file size in bytes
  chunkedUpload?: boolean;          // Use chunked upload for large files (>10MB)
  
  /** Select/Slider configurations */
  options?: Array<string | { value: string; label: string; helpText?: string }>;
  visual?: boolean;                 // Show visual representation for slider values
  
  /** Template-specific (Vidu) */
  categories?: string[];            // Template categories: ["STANDARD", "PREMIUM", "ADVANCED"]
  costTiers?: boolean;              // Show cost differences per tier
  
  /** Validation rules */
  validation?: ValidationRules;
  
  /** Conditional rendering logic */
  conditional?: ConditionalLogic;
}

/**
 * Field option with value and label
 * Used for select dropdowns and radio groups
 */
export interface FieldOption<T = string> {
  value: T;
  label: string;
  helpText?: string;
  disabled?: boolean;
}

/**
 * Base props for all field components
 */
export interface BaseFieldProps {
  fieldName: string;
  label?: string;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Props for file upload fields
 */
export interface FileFieldProps extends BaseFieldProps {
  accept?: string;
  maxFiles?: number;
  minFiles?: number;
  sizeLimit?: number;
  preview?: boolean;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: () => void;
  onUploadError?: (error: Error) => void;
}

/**
 * Props for select fields
 */
export interface SelectFieldProps extends BaseFieldProps {
  options: Array<string | FieldOption>;
  multiple?: boolean;
  searchable?: boolean;
}

/**
 * Props for slider fields
 */
export interface SliderFieldProps extends BaseFieldProps {
  min: number;
  max: number;
  step: number;
  showInput?: boolean;
  showMarks?: boolean;
  visual?: boolean;
}

/**
 * Props for toggle fields
 */
export interface ToggleFieldProps extends BaseFieldProps {
  defaultValue?: boolean;
}

/**
 * Type guard to check if options are FieldOption objects
 */
export function isFieldOption(option: any): option is FieldOption {
  return typeof option === "object" && "value" in option && "label" in option;
}

/**
 * Helper to normalize options to FieldOption format
 */
export function normalizeOptions(
  options: Array<string | number | FieldOption>
): FieldOption[] {
  return options.map((opt) => {
    if (isFieldOption(opt)) {
      return opt;
    }
    const value = String(opt);
    return { value, label: value };
  });
}

/**
 * Get default value for a field based on its metadata
 */
export function getFieldDefault(
  fieldName: string,
  metadata: FieldMetadata,
  model: ModelType
): any {
  // Try to get default from model.fieldOptions first
  const modelFieldOption = model.fieldOptions?.[fieldName];
  if (modelFieldOption?.default !== undefined) {
    return modelFieldOption.default;
  }
  
  // Fall back to type-specific defaults
  switch (metadata.type) {
    case "textarea":
      return "";
    case "toggle":
      return false;
    case "number":
    case "slider":
      return metadata.validation?.min || 0;
    case "file-single":
      return null;
    case "file-multiple":
    case "url-array":
      return [];
    default:
      return "";
  }
}

