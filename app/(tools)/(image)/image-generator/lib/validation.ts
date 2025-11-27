/**
 * Zod Validation Schemas for Image Generation
 * 
 * Shared between client and server for consistent validation
 */

import { z } from "zod";
import { ModelSettings } from "../lib/modelRegistry";
import { ActiveTab } from "../types/shared.types";
import { getFieldMetadata, PRIMARY_FIELD_KEYS } from "../lib/fieldMetadata";

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
  
  const candidateFields = new Set<string>([
    ...Object.keys(settings),
    ...PRIMARY_FIELD_KEYS,
    "prompt",
    "style_prompt",
    "reference_images",
    "original_image",
  ]);

  candidateFields.forEach((fieldName) => {
    if (schemaFields[fieldName]) {
      return;
    }

    const config = settings[fieldName] || {};
    const metadata = getFieldMetadata(fieldName);

    if (!config && !metadata) {
      return;
    }

    if (fieldName === "prompt" || fieldName === "style_prompt") {
      return;
    }

    // File fields are validated via their URL counterparts above
    if (fieldName === "reference_images" || fieldName === "original_image" || fieldName === "image_urls") {
      return;
    }

    const options = config.options || metadata?.options;
    let fieldSchema: z.ZodTypeAny = z.any().optional();

    if (options && options.length > 0) {
      const optionValues = options.map((opt: any) => {
        if (typeof opt === "string") return opt;
        if (typeof opt === "object" && opt.value) return opt.value;
        return String(opt);
      });
      fieldSchema = z.enum(optionValues as [string, ...string[]]).optional();
    } else if (config.type === "number" || config.type === "integer" || metadata?.kind === "number") {
      let numberSchema = z.number();
      const min = config.min ?? metadata?.min;
      const max = config.max ?? metadata?.max;
      if (typeof min === "number") {
        numberSchema = numberSchema.min(min);
      }
      if (typeof max === "number") {
        numberSchema = numberSchema.max(max);
      }
      fieldSchema = numberSchema.optional();
    } else if (config.type === "string" || typeof config.default === "string" || metadata?.kind === "text") {
      let stringSchema = z.string();
      const minLength = config.minLength;
      const maxLength = config.maxLength;
      if (typeof minLength === "number") {
        stringSchema = stringSchema.min(minLength);
      }
      if (typeof maxLength === "number") {
        stringSchema = stringSchema.max(maxLength);
      }
      fieldSchema = stringSchema.optional();
    }

    if (config.required === true && fieldSchema instanceof z.ZodOptional) {
      fieldSchema = fieldSchema.unwrap() as z.ZodTypeAny;
    }

    if (metadata?.includeWhenEmpty && fieldSchema instanceof z.ZodOptional) {
      fieldSchema = fieldSchema.unwrap() as z.ZodTypeAny;
    }

    const backendKey = config.backendKey || metadata?.backendKey || fieldName;

    if (!schemaFields[backendKey]) {
      schemaFields[backendKey] = fieldSchema;
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

