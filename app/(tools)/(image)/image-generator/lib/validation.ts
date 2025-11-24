/**
 * Zod Validation Schemas for Image Generation
 * 
 * Shared between client and server for consistent validation
 */

import { z } from "zod";
import { ModelSettings } from "../lib/modelRegistry";
import { ActiveTab } from "../store/useImageGenerationStore";

/**
 * Base schema for image generation request
 */
export const imageGenerationRequestSchema = z.object({
  modelId: z.string().min(1, "Model ID is required"),
  tab: z.enum(["text-to-image", "image-reference", "restyle"]),
  params: z.record(z.string(), z.any()), // Model-specific parameters (key: string, value: any)
});

/**
 * Cloudinary URL validation
 */
const cloudinaryUrlSchema = z.string().url().refine(
  (url) => url.includes("res.cloudinary.com"),
  {
    message: "Must be a valid Cloudinary URL",
  }
);

/**
 * Build dynamic validation schema based on model settings and active tab
 */
export function buildModelValidationSchema(
  settings: ModelSettings,
  activeTab: ActiveTab
): z.ZodObject<any> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  
  // Tab-specific required fields
  if (activeTab === "text-to-image") {
    schemaFields.prompt = z.string().min(1, "Prompt is required");
  } else if (activeTab === "image-reference") {
    schemaFields.prompt = z.string().min(1, "Prompt is required");
    schemaFields.reference_image_urls = z
      .array(cloudinaryUrlSchema)
      .min(1, "At least one reference image is required");
  } else if (activeTab === "restyle") {
    schemaFields.style_prompt = z.string().min(1, "Style prompt is required");
    schemaFields.original_image_url = cloudinaryUrlSchema;
  }
  
  // Process model settings to build validation rules
  Object.entries(settings).forEach(([fieldName, config]) => {
    if (!config || typeof config !== "object") {
      return;
    }
    
    // Skip prompt fields (already handled by tab-specific logic)
    if (fieldName === "prompt" || fieldName === "style_prompt") {
      return;
    }
    
    // Skip file fields (they should be converted to URLs before validation)
    if (
      fieldName === "reference_images" ||
      fieldName === "original_image" ||
      fieldName === "image_urls"
    ) {
      return;
    }
    
    let fieldSchema: z.ZodTypeAny;
    
    // Handle select fields
    if (config.options && Array.isArray(config.options)) {
      const options = config.options.map((opt: any) => {
        if (typeof opt === "string") return opt;
        if (typeof opt === "object" && opt.value) return opt.value;
        return String(opt);
      });
      
      fieldSchema = z.enum(options as [string, ...string[]]).optional();
    }
    // Handle number/integer fields
    else if (config.type === "number" || config.type === "integer") {
      let numberSchema = z.number();
      
      if (typeof config.min === "number") {
        numberSchema = numberSchema.min(config.min);
      }
      if (typeof config.max === "number") {
        numberSchema = numberSchema.max(config.max);
      }
      
      fieldSchema = numberSchema.optional();
    }
    // Handle string fields
    else if (config.type === "string" || typeof config.default === "string") {
      let stringSchema = z.string();
      
      if (typeof config.maxLength === "number") {
        stringSchema = stringSchema.max(config.maxLength);
      }
      if (typeof config.minLength === "number") {
        stringSchema = stringSchema.min(config.minLength);
      }
      
      fieldSchema = stringSchema.optional();
    }
    // Handle array fields
    else if (config.type === "array") {
      fieldSchema = z.array(z.string()).optional();
    }
    // Default to any
    else {
      fieldSchema = z.any().optional();
    }
    
    // Make required if specified
    if (config.required === true && !schemaFields[fieldName]) {
      // Remove .optional() and make required
      if (fieldSchema instanceof z.ZodOptional) {
        fieldSchema = (fieldSchema as z.ZodOptional<any>).unwrap();
      }
    }
    
    // Only add if not already defined
    if (!schemaFields[fieldName]) {
      schemaFields[fieldName] = fieldSchema;
    }
  });
  
  return z.object(schemaFields);
}

/**
 * Validate generation parameters
 */
export function validateGenerationParams(
  params: Record<string, any>,
  settings: ModelSettings,
  activeTab: ActiveTab
): { success: boolean; error?: string; data?: any } {
  try {
    const schema = buildModelValidationSchema(settings, activeTab);
    const validated = schema.parse(params);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: `${firstError.path.join(".")}: ${firstError.message}`,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Validation failed",
    };
  }
}

/**
 * Validate the full request (including modelId and tab)
 */
export function validateRequest(
  request: {
    modelId: string;
    tab: ActiveTab;
    params: Record<string, any>;
  },
  settings: ModelSettings
): { success: boolean; error?: string; data?: any } {
  // Validate base request structure
  const baseValidation = imageGenerationRequestSchema.safeParse(request);
  if (!baseValidation.success) {
    const firstError = baseValidation.error.issues[0];
    return {
      success: false,
      error: `${firstError.path.join(".")}: ${firstError.message}`,
    };
  }
  
  // Validate parameters
  return validateGenerationParams(request.params, settings, request.tab);
}

