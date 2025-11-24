/**
 * Complete Field Registry
 * Maps all field names to their rendering configuration
 * Covers all unique fields across 76 video models
 */

import { FieldMetadata } from "../types/field.types";

/**
 * Central field registry mapping field names to metadata
 * This is the single source of truth for field rendering
 */
export const FIELD_REGISTRY: Record<string, FieldMetadata> = {
  // ============================================================
  // TEXT INPUT FIELDS
  // ============================================================
  
  prompt: {
    type: "textarea",
    component: "PromptTextarea",
    label: "Prompt",
    placeholder: "Describe the video you want to generate...",
    helpText: "Be specific and detailed for best results",
    validation: {
      required: true,
      minLength: 3,
      maxLength: (model) => model.capabilities?.promptCharacterLimit || 1500,
    },
  },
  
  negativePrompt: {
    type: "textarea",
    component: "PromptTextarea",
    label: "Negative Prompt",
    placeholder: "Describe what you don't want in the video...",
    helpText: "Optional: Specify elements to avoid in the generated video",
    validation: {
      maxLength: (model) => model.capabilities?.negativePromptCharacterLimit || 1500,
    },
  },
  
  // ============================================================
  // SINGLE FILE UPLOADS (Base64)
  // ============================================================
  
  imageBase64: {
    type: "file-single",
    component: "ImageUploadField",
    label: "Start Image",
    accept: "image/*",
    preview: true,
    sizeLimit: 10 * 1024 * 1024, // 10MB
    dimensionValidation: {
      minAspectRatio: 0.5,  // For WAN models
      maxAspectRatio: 2.0,
    },
    helpText: "Upload an image to animate or use as reference",
  },
  
  videoBase64: {
    type: "file-single",
    component: "VideoUploadField",
    label: "Source Video",
    accept: "video/*",
    preview: true,
    sizeLimit: 100 * 1024 * 1024, // 100MB
    chunkedUpload: true,
    validation: {
      maxDuration: 10, // 10 seconds
    },
    helpText: "Upload a video to transform or animate",
  },
  
  endFrameImageBase64: {
    type: "file-single",
    component: "ImageUploadField",
    label: "End Frame",
    accept: "image/*",
    preview: true,
    sizeLimit: 10 * 1024 * 1024,
    conditional: {
      requiresCapability: "supportsEndFrame",
    },
    helpText: "Optional: Upload an end frame for transitions",
  },
  
  // ============================================================
  // MULTIPLE FILE UPLOADS
  // ============================================================
  
  referenceImageUrls: {
    type: "file-multiple",
    component: "MultiImageUploadField",
    label: "Reference Images",
    accept: "image/*",
    maxFiles: 4,
    minFiles: 1,
    preview: true,
    uploadToCloud: true, // Upload to temp storage, return URLs
    helpText: "Upload 1-4 reference images (ingredients) for consistent subject appearance",
  },
  
  scenesImages: {
    type: "file-multiple",
    component: "SceneImagesUploadField",
    label: "Scene Images",
    accept: "image/*",
    maxFiles: 16,
    minFiles: 2,
    preview: true,
    reorderable: true, // User can drag to reorder scenes
    helpText: "Upload 2-16 scene images. Drag to reorder sequence.",
  },
  
  // ============================================================
  // URL/STRING ARRAY FIELDS
  // ============================================================
  
  tail_image_url: {
    type: "url-array",
    component: "TailImageUrlField",
    label: "Tail Image",
    accept: "image/*",
    conditional: {
      requiresCapability: "supportsTailImage",
    },
    helpText: "Optional: URL to continuation frame image",
  },
  
  // ============================================================
  // SELECT FIELDS
  // ============================================================
  
  duration: {
    type: "select",
    component: "SelectField",
    label: "Duration",
    conditional: {
      showIf: (model) => !model.capabilities?.fixedDuration,
    },
    helpText: "Video length in seconds",
  },
  
  aspectRatio: {
    type: "select",
    component: "SelectField",
    label: "Aspect Ratio",
    helpText: "Video dimensions ratio",
  },
  
  resolution: {
    type: "select",
    component: "SelectField",
    label: "Resolution",
    helpText: "Video quality (higher = more credits)",
  },
  
  pixverseStyles: {
    type: "select",
    component: "SelectField",
    label: "Style",
    helpText: "Visual style for the generated video",
  },
  
  pikaScenesIngredient: {
    type: "select",
    component: "SelectField",
    label: "Mode",
    options: [
      { value: "creative", label: "Creative", helpText: "Artistic interpretation" },
      { value: "precise", label: "Precise", helpText: "Accurate to scenes" },
    ],
    helpText: "Creative mode for artistic results, Precise for accurate interpretation",
  },
  
  // ============================================================
  // TEMPLATE SELECT (Vidu-specific)
  // ============================================================
  
  template: {
    type: "template-select",
    component: "ViduTemplateSelector",
    label: "Template",
    categories: ["STANDARD", "PREMIUM", "ADVANCED"],
    costTiers: true,
    helpText: "Choose a template. Higher tiers cost more credits.",
  },
  
  // ============================================================
  // TOGGLE FIELDS (Boolean)
  // ============================================================
  
  enhancePrompt: {
    type: "toggle",
    component: "ToggleField",
    label: "Enhance prompt automatically",
    helpText: "AI will improve your prompt for better results",
  },
  
  promptOptimizer: {
    type: "toggle",
    component: "ToggleField",
    label: "Use prompt optimizer",
    helpText: "Optimize prompt for better video generation",
  },
  
  loop: {
    type: "toggle",
    component: "ToggleField",
    label: "Loop video (blend end with beginning)",
    helpText: "Create a seamless loop",
  },
  
  cameraFixed: {
    type: "toggle",
    component: "ToggleField",
    label: "Fix camera position",
    helpText: "Lock camera to prevent movement",
  },
  
  addAudioToVideo: {
    type: "toggle",
    component: "ToggleField",
    label: "Add audio to video",
    helpText: "Generate audio for the video",
  },
  
  // ============================================================
  // SLIDER FIELDS
  // ============================================================
  
  movementAmplitude: {
    type: "slider",
    component: "MovementAmplitudeSlider",
    label: "Movement Amplitude",
    options: ["auto", "low", "medium", "high"],
    visual: true,  // Show visual representation
    helpText: "Control the intensity of motion in the video",
  },
  
  shift: {
    type: "slider",
    component: "SliderField",
    label: "Shift",
    helpText: "Control the transformation intensity",
    validation: {
      min: 0,
      max: 10,
    },
  },
  
  // ============================================================
  // NUMBER FIELDS
  // ============================================================
  
  seed: {
    type: "number",
    component: "NumberField",
    label: "Seed",
    helpText: "Random seed for reproducible results (leave empty for random)",
    validation: {
      min: 0,
      max: 999999999,
    },
  },
};

/**
 * Get field metadata by name
 * Returns metadata from registry or creates default metadata
 */
export function getFieldMetadata(
  fieldName: string,
  model?: any
): FieldMetadata {
  // Check if field exists in registry
  if (FIELD_REGISTRY[fieldName]) {
    return FIELD_REGISTRY[fieldName];
  }
  
  // If model has fieldOptions for this field, try to infer type
  if (model?.fieldOptions?.[fieldName]) {
    const fieldOption = model.fieldOptions[fieldName];
    
    // Infer type based on fieldOption properties
    if (fieldOption.options) {
      return {
        type: "select",
        component: "SelectField",
        label: fieldOption.label || formatFieldName(fieldName),
        helpText: fieldOption.helpText,
      };
    }
    
    if (typeof fieldOption.default === "boolean") {
      return {
        type: "toggle",
        component: "ToggleField",
        label: fieldOption.label || formatFieldName(fieldName),
        helpText: fieldOption.helpText,
      };
    }
    
    if (fieldOption.min !== undefined || fieldOption.max !== undefined) {
      return {
        type: "slider",
        component: "SliderField",
        label: fieldOption.label || formatFieldName(fieldName),
        helpText: fieldOption.helpText,
        validation: {
          min: fieldOption.min,
          max: fieldOption.max,
        },
      };
    }
  }
  
  // Default fallback based on field name patterns
  return inferFieldMetadata(fieldName);
}

/**
 * Infer field metadata from field name
 * Used as fallback when field is not in registry
 */
function inferFieldMetadata(fieldName: string): FieldMetadata {
  const lowerName = fieldName.toLowerCase();
  
  // File upload patterns
  if (lowerName.includes("image") || lowerName.includes("photo")) {
    return {
      type: "file-single",
      component: "ImageUploadField",
      label: formatFieldName(fieldName),
      accept: "image/*",
      preview: true,
    };
  }
  
  if (lowerName.includes("video")) {
    return {
      type: "file-single",
      component: "VideoUploadField",
      label: formatFieldName(fieldName),
      accept: "video/*",
      preview: true,
    };
  }
  
  // Text patterns
  if (lowerName.includes("prompt")) {
    return {
      type: "textarea",
      component: "PromptTextarea",
      label: formatFieldName(fieldName),
    };
  }
  
  // Boolean patterns
  if (lowerName.startsWith("is") || lowerName.startsWith("enable") || 
      lowerName.startsWith("has") || lowerName.startsWith("use")) {
    return {
      type: "toggle",
      component: "ToggleField",
      label: formatFieldName(fieldName),
    };
  }
  
  // Default to text input
  return {
    type: "textarea",
    component: "TextInput",
    label: formatFieldName(fieldName),
  };
}

/**
 * Format field name to human-readable label
 * Example: "aspectRatio" -> "Aspect Ratio"
 */
function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1") // Add space before capitals
    .replace(/_/g, " ")          // Replace underscores with spaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

/**
 * Get all field names from registry
 */
export function getAllRegisteredFields(): string[] {
  return Object.keys(FIELD_REGISTRY);
}

/**
 * Check if field is registered
 */
export function isFieldRegistered(fieldName: string): boolean {
  return fieldName in FIELD_REGISTRY;
}

