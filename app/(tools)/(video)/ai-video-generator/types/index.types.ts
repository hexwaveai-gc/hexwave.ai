/**
 * Field option with value and display label
 * Used for select dropdowns and radio groups
 */
export interface FieldOption<T = string> {
  value: T;
  label: string;
}

/**
 * Configuration for a single model field
 * Contains all metadata needed to render and validate the field
 */
export interface FieldConfiguration {
  options?: FieldOption<string>[] | string[] | number[];
  default: any;
  label?: string;
  userSelectable?: boolean;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
  placeholder?: string;
}

/**
 * Model capabilities and constraints
 * Flags that indicate what features a model supports
 */
export interface ModelCapabilities {
  supportsEndFrame: boolean;
  supportsTailImage: boolean;
  supportsAudioGeneration: boolean;
  promptCharacterLimit: number;
  negativePromptCharacterLimit: number;
  fixedDuration?: number;
  fixedAspectRatio?: string;
  fixedResolution?: string;
}

// Locally defined CostType to avoid import issues
export interface CostType {
    type: "fixed" | "per_second" | "tiered" | "tiered_template";
    value?: number;
    base_value?: number;
    additional_value?: number;
    standard_value?: number;
    premium_value?: number;
    advanced_value?: number;
    tiers?: Array<{ resolution?: string; value: number }>; // For resolution-based tiered pricing
  }
  
  // Interface for provider logos
  export interface ProviderLogosType {
    [key: string]: string;
  }
  
  // Interface for model categories used in the modal
  export interface ModelCategoryType {
    id: string;
    label: string;
  }
  
  // Comprehensive interface for a single AI model
  export interface ModelType {
    id: string;
    name: string;
    url: string;
    cost: CostType;
    fields: string[];
    // Optional fields for modal display
    provider?: string;
    logo?: string;
    description?: string;
    previewImage?: string;
    features?: string[];
    categories?: string[];
    
    // ✨ ENHANCED: Optional metadata for single source of truth
    // These fields consolidate all model-specific configuration
    // that was previously scattered across utility functions
    fieldOptions?: {
      duration?: FieldConfiguration;
      aspectRatio?: FieldConfiguration;
      resolution?: FieldConfiguration;
      loop?: FieldConfiguration;
      promptOptimizer?: FieldConfiguration;
      enhancePrompt?: FieldConfiguration;
      cameraFixed?: FieldConfiguration;
      negativePrompt?: FieldConfiguration;
      movementAmplitude?: FieldConfiguration;
      template?: FieldConfiguration;
      pixverseStyles?: FieldConfiguration;
      pikaScenesIngredient?: FieldConfiguration;
      shift?: FieldConfiguration;
      seed?: FieldConfiguration;
      addAudioToVideo?: FieldConfiguration;
      [key: string]: FieldConfiguration | undefined;
    };
    
    capabilities?: ModelCapabilities;
  }
  
  // Interface for the structure containing text, image, and video models
  export interface ModelsType {
    TEXT_MODELS: ModelType[];
    IMAGE_MODELS: ModelType[];
    VIDEO_MODELS?: ModelType[];
  }
  
  // Interface for enhanced model data, including its type (text/image/video)
  export interface EnhancedModelType extends ModelType {
    type: "text" | "image" | "video";
  }
  
  // Interface for a single field configuration option
  export interface FieldOptionType {
    value: string;
    label: string;
  }
  
  // Interface for the configuration of a single input field
  export interface FieldConfigType {
    type: "textarea" | "select" | "checkbox" | "file";
    label: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
    options?: FieldOptionType[];
    categoryOptions?: boolean; // Indicates if options are grouped by category (like Vidu templates)
    accept?: string; // For file input types
  }
  
  // Interface for the collection of all field configurations
  export interface FieldConfigsType {
    [key: string]: FieldConfigType;
    // Ensure all potential keys are covered if possible, or use a general index signature
    // Example specific fields:
    // prompt: FieldConfigType;
    // negativePrompt: FieldConfigType;
    // duration: FieldConfigType;
    // ... add others as needed
  }
  
  // Interface for Vidu templates structure
  export interface TemplateType {
    [category: string]: {
      // e.g., STANDARD, PREMIUM, ADVANCED
      [templateId: string]: string; // e.g., HUG: "hug"
    };
  }
  
  // Interface for the payload sent to the video generation API
  export interface VideoGenerationPayload {
    prompt: string;
    model: string; // Model URL
    duration?: number;
    aspectRatio?: string;
    promptOptimizer?: boolean;
    negativePrompt?: string;
    loop?: boolean;
    addAudioToVideo?: boolean;
    imageBase64?: string;
    endFrameImageBase64?: string;
    tail_image_url?: string;
    pikaScenesIngredient?: string;
    movementAmplitude?: string;
    template?: string; // Template ID for Vidu Template model
    cameraControl?: string;
    pixverseStyles?: string;
  }
  