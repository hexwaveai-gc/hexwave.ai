import { ModelType } from "./index.types";

/**
 * Enhanced model types for AI Video Generator
 * 
 * This file defines the structure for consolidating ALL model metadata
 * into models.constants.ts as a single source of truth.
 * 
 * Goals:
 * - Eliminate scattered logic in utility functions
 * - Make model definitions self-contained
 * - Enable automatic UI rendering from model metadata
 * - Maintain 100% backward compatibility
 */

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
  /**
   * Available options for select/slider fields
   * Can be:
   * - Array of strings: ["5", "10", "15"] for simple selects
   * - Array of numbers: [5, 10, 15] for numeric selects
   * - Array of FieldOption objects: [{ value: "16:9", label: "Landscape" }]
   */
  options?: FieldOption<string>[] | string[] | number[];
  
  /**
   * Default value for this field
   * Used for initialization and reset
   */
  default: any;
  
  /**
   * Display label for the field
   * Shown above the input in the UI
   */
  label?: string;
  
  /**
   * Whether user can change this value
   * If false, field is hidden or disabled
   */
  userSelectable?: boolean;
  
  /**
   * Minimum value for sliders/numeric inputs
   */
  min?: number;
  
  /**
   * Maximum value for sliders/numeric inputs
   */
  max?: number;
  
  /**
   * Step increment for sliders/numeric inputs
   */
  step?: number;
  
  /**
   * Help text shown below the field
   */
  helpText?: string;
  
  /**
   * Placeholder text for inputs
   */
  placeholder?: string;
}

/**
 * Model capabilities and constraints
 * Flags that indicate what features a model supports
 */
export interface ModelCapabilities {
  /**
   * Whether model supports end frame image upload
   * Used for video interpolation/transition effects
   */
  supportsEndFrame: boolean;
  
  /**
   * Whether model supports tail image (continuation frame)
   * Used for extended video generation
   */
  supportsTailImage: boolean;
  
  /**
   * Whether model generates audio automatically
   * Some models (VEO3, Sora) always include audio
   */
  supportsAudioGeneration: boolean;
  
  /**
   * Maximum characters allowed in prompt field
   * Different models have different limits (1000-10000)
   */
  promptCharacterLimit: number;
  
  /**
   * Maximum characters allowed in negative prompt field
   */
  negativePromptCharacterLimit: number;
  
  /**
   * If model uses a fixed duration regardless of user input
   * Example: VEO3 always generates 8-second videos
   */
  fixedDuration?: number;
  
  /**
   * If model uses fixed aspect ratio regardless of user input
   */
  fixedAspectRatio?: string;
  
  /**
   * If model uses fixed resolution regardless of user input
   */
  fixedResolution?: string;
}

/**
 * Enhanced model type with complete metadata
 * Extends the base ModelType with field configurations and capabilities
 * 
 * This is the target structure for all models after migration.
 * Legacy models without these fields will fall back to utility functions.
 */
export interface EnhancedModelType extends ModelType {
  /**
   * Field configurations with options, defaults, and labels
   * Each key corresponds to a field name in the model.fields array
   */
  fieldOptions?: {
    /** Duration field configuration */
    duration?: FieldConfiguration;
    
    /** Aspect ratio field configuration */
    aspectRatio?: FieldConfiguration;
    
    /** Resolution field configuration */
    resolution?: FieldConfiguration;
    
    /** Loop toggle configuration */
    loop?: FieldConfiguration;
    
    /** Prompt optimizer toggle configuration */
    promptOptimizer?: FieldConfiguration;
    
    /** Enhance prompt toggle configuration */
    enhancePrompt?: FieldConfiguration;
    
    /** Camera fixed toggle configuration */
    cameraFixed?: FieldConfiguration;
    
    /** Negative prompt field configuration */
    negativePrompt?: FieldConfiguration;
    
    /** Movement amplitude field configuration (Vidu models) */
    movementAmplitude?: FieldConfiguration;
    
    /** Template selection configuration (Vidu Template) */
    template?: FieldConfiguration;
    
    /** Pixverse styles configuration */
    pixverseStyles?: FieldConfiguration;
    
    /** Pika scenes ingredient configuration */
    pikaScenesIngredient?: FieldConfiguration;
    
    /** Shift parameter configuration (WAN video-to-video) */
    shift?: FieldConfiguration;
    
    /** Seed value configuration */
    seed?: FieldConfiguration;
    
    /** Add audio to video toggle */
    addAudioToVideo?: FieldConfiguration;
    
    /** Allow additional fields for future expansion */
    [key: string]: FieldConfiguration | undefined;
  };
  
  /**
   * Model capabilities and feature flags
   * Indicates what special features this model supports
   */
  capabilities?: ModelCapabilities;
}

/**
 * Type guard to check if a model has enhanced metadata
 * @param model - Model to check
 * @returns True if model has fieldOptions or capabilities
 */
export function isEnhancedModel(model: ModelType): model is EnhancedModelType {
  const enhanced = model as EnhancedModelType;
  return !!(enhanced.fieldOptions || enhanced.capabilities);
}

/**
 * Helper type for migration tracking
 * Used by migration scripts to track which models have been enhanced
 */
export interface MigrationStatus {
  modelId: string;
  hasFieldOptions: boolean;
  hasCapabilities: boolean;
  isFullyMigrated: boolean;
  migratedFields: string[];
  missingFields: string[];
}

