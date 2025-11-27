import { 
  ModelType, 
  FieldConfiguration, 
  FieldOption, 
  ModelCapabilities 
} from "./index.types";

// Re-export for backward compatibility
export type { FieldConfiguration, FieldOption, ModelCapabilities };

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

