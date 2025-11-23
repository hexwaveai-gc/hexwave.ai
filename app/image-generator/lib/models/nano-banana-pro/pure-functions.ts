/**
 * Pure functions for Nano Banana Pro model operations
 * All functions are pure - no side effects, same input = same output
 * This is the single source of truth for Nano Banana Pro operations
 */

import nanoBananaProSettings from "./settings";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Platform fee multiplier for all image generation
 */
const PLATFORM_FEE_MULTIPLIER = 0.769;

/**
 * Base cost per image in credits (1M credits = $1)
 * $0.15 per image (1K/2K resolution)
 */
const NANO_BANANA_BASE_COST_PER_IMAGE = 0.15 * 1000000;

/**
 * 4K resolution cost multiplier (2x the base cost)
 */
const RESOLUTION_4K_MULTIPLIER = 2;

/**
 * Valid aspect ratios supported by Nano Banana Pro
 * Note: "auto" is only valid for edit mode (image-to-image)
 */
const VALID_ASPECT_RATIOS = [
  "auto",
  "21:9",
  "16:9",
  "3:2",
  "4:3",
  "5:4",
  "1:1",
  "4:5",
  "3:4",
  "2:3",
  "9:16",
];

/**
 * Valid resolutions supported by Nano Banana Pro
 */
const VALID_RESOLUTIONS = ["1K", "2K", "4K"];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates Nano Banana Pro parameters
 * @param params - Parameters to validate
 * @returns Object with valid flag and errors array
 */
export function validateNanoBananaProParams(params: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate prompt
  if (!params.prompt) {
    errors.push("Prompt is required");
  } else if (params.prompt.length > 5000) {
    // Gemini 3 Pro has higher token limit
    errors.push("Prompt must be less than 5000 characters");
  }

  // Validate number of images (handle both camelCase and snake_case)
  const numImages = params.num_images || params.numImages;
  if (numImages !== undefined) {
    const num = parseInt(numImages);
    if (isNaN(num) || num < 1 || num > 4) {
      errors.push("Number of images must be between 1 and 4");
    }
  }

  // Validate output format
  if (
    params.output_format &&
    !nanoBananaProSettings.output_format.options.includes(params.output_format)
  ) {
    errors.push(`Invalid output format: ${params.output_format}`);
  }

  // Validate aspect ratio
  if (
    params.aspect_ratio &&
    !VALID_ASPECT_RATIOS.includes(params.aspect_ratio)
  ) {
    errors.push(`Invalid aspect ratio: ${params.aspect_ratio}`);
  }

  // Validate resolution
  if (params.resolution && !VALID_RESOLUTIONS.includes(params.resolution)) {
    errors.push(`Invalid resolution: ${params.resolution}`);
  }

  // Validate uploaded images (up to 14 for Gemini 3 Pro)
  if (params.uploadedImages && params.uploadedImages.length > 14) {
    errors.push("Maximum 14 images allowed for editing");
  }

  // Validate aspect ratio "auto" is only for edit mode
  const hasImages = params.uploadedImages && params.uploadedImages.length > 0;
  if (params.aspect_ratio === "auto" && !hasImages) {
    // This is handled in buildNanoBananaProRequest by defaulting to "1:1"
    // No error, just noting it will be auto-corrected
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// COST CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates the cost for Nano Banana Pro generation
 * @param numImages - Number of images to generate
 * @param resolution - Resolution setting (1K, 2K, 4K)
 * @returns Cost in credits
 */
export function calculateNanoBananaProCost(
  numImages: number = 1,
  resolution: string = "1K"
): number {
  const safeNumImages = Math.max(1, Math.min(4, numImages));

  // Base cost per image
  let costPerImage = NANO_BANANA_BASE_COST_PER_IMAGE;

  // 4K resolution doubles the cost
  if (resolution === "4K") {
    costPerImage *= RESOLUTION_4K_MULTIPLIER;
  }

  // Apply platform fee
  return Math.round(costPerImage * PLATFORM_FEE_MULTIPLIER * safeNumImages);
}

/**
 * Calculates cost per single image (for compatibility)
 * @param resolution - Resolution setting (1K, 2K, 4K)
 * @returns Cost in credits for one image
 */
export function calculateNanoBananaProCostPerImage(
  resolution: string = "1K"
): number {
  return calculateNanoBananaProCost(1, resolution);
}

// ============================================================================
// PARAMETER NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Normalizes Nano Banana Pro parameters to ensure they meet API requirements
 * @param params - Raw parameters
 * @returns Normalized parameters
 */
export function normalizeNanoBananaProParams(params: any): any {
  const normalized = { ...params };

  // Handle both camelCase (aspectRatio) and snake_case (aspect_ratio)
  // Ensure aspect_ratio is set and valid
  if (!normalized.aspect_ratio && !normalized.aspectRatio) {
    normalized.aspect_ratio = nanoBananaProSettings.aspect_ratio.default;
  } else {
    normalized.aspect_ratio = normalized.aspect_ratio || normalized.aspectRatio;
  }

  // Handle "auto" aspect ratio for text-to-image (not valid)
  const hasImages =
    normalized.uploadedImages && normalized.uploadedImages.length > 0;
  if (normalized.aspect_ratio === "auto" && !hasImages) {
    normalized.aspect_ratio = "1:1"; // Default for text-to-image
  }

  // Handle both camelCase (outputFormat) and snake_case (output_format)
  // Ensure output_format is set
  if (!normalized.output_format && !normalized.outputFormat) {
    normalized.output_format = nanoBananaProSettings.output_format.default;
  } else {
    normalized.output_format =
      normalized.output_format || normalized.outputFormat;
  }

  // Ensure resolution is set
  if (!normalized.resolution) {
    normalized.resolution = nanoBananaProSettings.resolution.default;
  }

  // Ensure num_images is set and within bounds
  // Handle both camelCase (numImages from client) and snake_case (num_images from API)
  if (!normalized.num_images && !normalized.numImages) {
    normalized.num_images = nanoBananaProSettings.num_images.default;
  } else {
    const numImages = normalized.num_images || normalized.numImages;
    normalized.num_images = Math.max(
      nanoBananaProSettings.num_images.min,
      Math.min(
        nanoBananaProSettings.num_images.max,
        parseInt(numImages) || nanoBananaProSettings.num_images.default
      )
    );
  }

  return normalized;
}

// ============================================================================
// REQUEST BUILDING FUNCTIONS
// ============================================================================

/**
 * Builds request parameters for Nano Banana Pro API
 * @param params - Input parameters
 * @returns Object with request params, edit mode flag, and mode description
 */
export function buildNanoBananaProRequest(params: any): {
  request: any;
  useEditMode: boolean;
  mode: string;
} {
  const normalized = normalizeNanoBananaProParams(params);

  // Determine if this is edit mode (has uploaded images)
  const useEditMode =
    normalized.uploadedImages && normalized.uploadedImages.length > 0;

  // Build base request
  // Add "Create an image: " prefix to force image generation with Google Search grounding
  // This ensures the model generates images instead of just providing search results
  const enhancedPrompt = `Create an image: ${normalized.prompt}`;

  const request: any = {
    prompt: enhancedPrompt,
    num_images: normalized.num_images,
    aspect_ratio: normalized.aspect_ratio,
    output_format: normalized.output_format,
    sync_mode: normalized.sync_mode || false,
    resolution: normalized.resolution,
  };

  // Add image URLs if in edit mode
  if (useEditMode) {
    request.image_urls = normalized.uploadedImages.map((file: any) =>
      typeof file === "string" ? file : file.cdnUrl || file.url || file
    );
  }

  return {
    request,
    useEditMode,
    mode: useEditMode ? "edit" : "generation",
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets default values for Nano Banana Pro
 * @returns Object with default values
 */
export function getNanoBananaProDefaults() {
  return {
    aspect_ratio: nanoBananaProSettings.aspect_ratio.default,
    output_format: nanoBananaProSettings.output_format.default,
    resolution: nanoBananaProSettings.resolution.default,
    num_images: nanoBananaProSettings.num_images.default,
    sync_mode: false,
  };
}

/**
 * Checks if a given model is Nano Banana Pro
 * @param model - Model identifier
 * @returns boolean
 */
export function isNanoBananaProModel(model: string): boolean {
  return (
    model === "nano-banana-pro" ||
    model === "gemini-3-pro-image-preview" ||
    model === "fal-ai/nano-banana-pro" ||
    model === "fal-ai/nano-banana-pro/edit"
  );
}
