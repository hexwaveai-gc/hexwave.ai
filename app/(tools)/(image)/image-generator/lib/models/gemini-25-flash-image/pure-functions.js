/**
 * Pure functions for Gemini 2.5 Flash Image model operations
 * All functions are pure - no side effects, same input = same output
 * This is the single source of truth for Gemini 2.5 Flash operations
 */

import gemini25FlashImageSettings from "./settings";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Platform fee multiplier for all image generation
 */
const PLATFORM_FEE_MULTIPLIER = 0.769;

/**
 * Base cost per image in credits (1M credits = $1)
 * From model-configs.js: 0.05 * 1000000 = 50000
 */
const GEMINI_BASE_COST_PER_IMAGE = 0;

/**
 * Cost for image editing operations (fixed)
 * Aligned with other models: 0.08 * 1000000 = 80000
 */
const GEMINI_EDIT_COST = 0;

/**
 * Valid aspect ratios supported by Gemini 2.5 Flash
 */
const VALID_ASPECT_RATIOS = [
  "21:9",
  "1:1",
  "4:3",
  "3:2",
  "2:3",
  "5:4",
  "4:5",
  "3:4",
  "16:9",
  "9:16",
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates Gemini 2.5 Flash Image parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateGeminiParams(params) {
  const errors = [];

  // Validate prompt
  if (!params.prompt) {
    errors.push("Prompt is required");
  } else if (params.prompt.length > 3500) {
    errors.push("Prompt must be less than 3500 characters");
  }

  // Validate number of images
  if (params.num_images !== undefined) {
    const num = parseInt(params.num_images);
    if (
      isNaN(num) ||
      num < gemini25FlashImageSettings.num_images.min ||
      num > gemini25FlashImageSettings.num_images.max
    ) {
      errors.push(
        `Number of images must be between ${gemini25FlashImageSettings.num_images.min} and ${gemini25FlashImageSettings.num_images.max}`
      );
    }
  }

  // Validate output format
  if (
    params.output_format &&
    !gemini25FlashImageSettings.output_format.options.includes(
      params.output_format
    )
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

  // Validate uploaded images
  if (params.uploadedImages?.length > 10) {
    errors.push("Maximum 10 images allowed for editing");
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
 * Calculates the cost for Gemini 2.5 Flash generation
 * @param {number} numImages - Number of images to generate
 * @param {boolean} isEdit - Whether this is an edit operation
 * @returns {number} Cost in credits
 */
export function calculateGeminiCost(numImages = 1, isEdit = false) {
  const safeNumImages = Math.max(
    gemini25FlashImageSettings.num_images.min,
    Math.min(gemini25FlashImageSettings.num_images.max, numImages)
  );

  // Edit operations have a fixed cost per image
  const baseCostPerImage = isEdit
    ? GEMINI_EDIT_COST
    : GEMINI_BASE_COST_PER_IMAGE;

  // Apply platform fee
  return Math.round(baseCostPerImage * PLATFORM_FEE_MULTIPLIER * safeNumImages);
}

/**
 * Calculates cost per single image (for compatibility)
 * @param {boolean} isEdit - Whether this is an edit operation
 * @returns {number} Cost in credits for one image
 */
export function calculateGeminiCostPerImage(isEdit = false) {
  return calculateGeminiCost(1, isEdit);
}

// ============================================================================
// PARAMETER MAPPING FUNCTIONS
// ============================================================================

/**
 * Maps aspect ratio to Gemini format
 * @param {string} input - Aspect ratio input
 * @returns {string} Gemini aspect ratio format
 */
export function mapToGeminiAspectRatio(input) {
  if (!input) return gemini25FlashImageSettings.aspect_ratio.default;

  // Handle object format (custom dimensions from Seedream)
  if (typeof input === "object" && input.width && input.height) {
    // Gemini doesn't support custom dimensions, return default
    return gemini25FlashImageSettings.aspect_ratio.default;
  }

  // Common aspect ratio mappings
  const mappings = {
    "21:9": "21:9",
    "1:1": "1:1",
    "4:3": "4:3",
    "3:2": "3:2",
    "2:3": "2:3",
    "5:4": "5:4",
    "4:5": "4:5",
    "3:4": "3:4",
    "16:9": "16:9",
    "9:16": "9:16",
    // Legacy mappings
    "16:10": "16:9", // Map to closest
    "10:16": "9:16", // Map to closest
    square: "1:1",
    portrait: "3:4",
    landscape: "4:3",
  };

  return mappings[input] || gemini25FlashImageSettings.aspect_ratio.default;
}

/**
 * Normalizes parameters for Gemini 2.5 Flash
 * @param {Object} params - Raw parameters
 * @returns {Object} Normalized parameters with defaults
 */
export function normalizeGeminiParams(params) {
  return {
    prompt: params.prompt || params.description || "",
    num_images:
      parseInt(params.num_images || params.numImages) ||
      gemini25FlashImageSettings.num_images.default,
    output_format:
      params.output_format ||
      params.outputFormat ||
      gemini25FlashImageSettings.output_format.default,
    sync_mode:
      params.sync_mode !== undefined
        ? params.sync_mode
        : gemini25FlashImageSettings.sync_mode.default,
    aspect_ratio: mapToGeminiAspectRatio(
      params.aspect_ratio || params.aspectRatio || "1:1"
    ),
    uploadedImages: params.uploadedImages || [],
    image_urls:
      params.image_urls ||
      params.uploadedImages?.map((img) =>
        typeof img === "string" ? img : img.cdnUrl || img.url
      ) ||
      [],
  };
}

/**
 * Filters parameters to only include Gemini relevant fields
 * @param {Object} params - Parameters object
 * @returns {Object} Filtered parameters
 */
export function filterGeminiParams(params) {
  // Return all params - let the backend handle what it needs
  // This maintains compatibility with tool-specific params
  return { ...params };
}

// ============================================================================
// REQUEST BUILDER FUNCTIONS
// ============================================================================

/**
 * Determines if request should use edit mode
 * @param {Object} params - Normalized parameters
 * @returns {Object} { useEditMode: boolean, reason: string }
 */
export function determineGeminiMode(params) {
  // User-provided images: Always use edit mode
  if (params.uploadedImages?.length > 0 || params.image_urls?.length > 0) {
    return {
      useEditMode: true,
      reason: "user-images",
    };
  }

  // Default: Standard generation (aspect ratio is now natively supported)
  return {
    useEditMode: false,
    reason: "standard",
  };
}

/**
 * Builds Gemini generation request (standard mode)
 * @param {Object} params - Normalized parameters
 * @returns {Object} Gemini generation request
 */
export function buildGeminiGenerateRequest(params) {
  return {
    prompt: params.prompt,
    num_images: params.num_images,
    output_format: params.output_format,
    sync_mode: params.sync_mode,
    aspect_ratio: params.aspect_ratio,
  };
}

/**
 * Builds Gemini edit request (edit mode)
 * @param {Object} params - Normalized parameters
 * @returns {Object} Gemini edit request
 */
export function buildGeminiEditRequest(params) {
  // User has uploaded images for editing
  return {
    prompt: params.prompt,
    image_urls: params.image_urls,
    num_images: params.num_images,
    output_format: params.output_format,
    aspect_ratio: params.aspect_ratio,
  };
}

/**
 * Builds complete Gemini request based on mode
 * @param {Object} params - Normalized parameters
 * @returns {Object} { request, useEditMode, mode }
 */
export function buildGeminiRequest(params) {
  const normalized = normalizeGeminiParams(params);
  const { useEditMode, reason } = determineGeminiMode(normalized);

  const request = useEditMode
    ? buildGeminiEditRequest(normalized)
    : buildGeminiGenerateRequest(normalized);

  return {
    request,
    useEditMode,
    mode: reason,
    originalPrompt: params.prompt, // Preserve original for DB storage
  };
}

// ============================================================================
// RESPONSE TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transforms Gemini response to standard format
 * @param {Object} response - Gemini API response
 * @returns {Array} Array of image URLs
 */
export function transformGeminiResponse(response) {
  if (!response?.images || !Array.isArray(response.images)) {
    return [];
  }

  return response.images
    .map((image) => {
      // Handle different response formats
      if (typeof image === "string") {
        return image;
      }
      if (image.url) {
        return image.url;
      }
      if (image.data) {
        return `data:image/png;base64,${image.data}`;
      }
      return null;
    })
    .filter(Boolean);
}

/**
 * Validates Gemini response
 * @param {Object} response - Gemini API response
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateGeminiResponse(response) {
  const errors = [];

  if (!response) {
    errors.push("No response received from Gemini");
  } else if (!response.images) {
    errors.push("Response missing images field");
  } else if (!Array.isArray(response.images)) {
    errors.push("Response images is not an array");
  } else if (response.images.length === 0) {
    errors.push("Response contains no images");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets default parameters for Gemini 2.5 Flash
 * @returns {Object} Default parameters
 */
export function getGeminiDefaults() {
  return {
    prompt: "",
    num_images: gemini25FlashImageSettings.num_images.default,
    output_format: gemini25FlashImageSettings.output_format.default,
    sync_mode: gemini25FlashImageSettings.sync_mode.default,
    aspect_ratio: gemini25FlashImageSettings.aspect_ratio.default,
  };
}

/**
 * Checks if a model is Gemini 2.5 Flash
 * @param {string} model - Model name
 * @returns {boolean} True if Gemini 2.5 Flash
 */
export function isGeminiModel(model) {
  return model === "gemini-25-flash-image";
}

/**
 * Estimates cost for client-side display
 * @param {Object} params - Parameters
 * @returns {number} Estimated cost in credits
 */
export function estimateGeminiCost(params) {
  const normalized = normalizeGeminiParams(params);
  const { useEditMode } = determineGeminiMode(normalized);
  return calculateGeminiCost(normalized.num_images, useEditMode);
}

/**
 * Gets aspect ratio options for UI
 * @returns {Array} Array of { value, label } objects
 */
export function getAspectRatioOptions() {
  return gemini25FlashImageSettings.aspect_ratio.options.map((option) => ({
    value: option.value,
    label: option.label,
  }));
}

/**
 * Gets output format options for UI
 * @returns {Array} Array of { value, label } objects
 */
export function getOutputFormatOptions() {
  return gemini25FlashImageSettings.output_format.options.map((format) => ({
    value: format,
    label: format.toUpperCase(),
  }));
}

// ============================================================================
// FASHION PHOTOSHOOT FUNCTIONS
// ============================================================================

/**
 * Builds a fashion photoshoot request using Gemini's multi-image capability
 * @param {Object} params - Fashion photoshoot parameters
 * @returns {Object} Gemini edit request for fashion photoshoot
 */
export function buildFashionPhotoshootRequest(params) {
  const {
    images = [],
    photoshootPrompt = "",
    num_images = 1,
    output_format = "png",
  } = params;

  // Build the prompt for fashion photoshoot
  const fashionPrompt =
    photoshootPrompt ||
    "Create a professional fashion photoshoot with the provided clothing and models. " +
      "Combine the outfits and people naturally in a cohesive fashion editorial style.";

  return {
    prompt: fashionPrompt,
    image_urls: images,
    num_images: num_images,
    output_format: output_format,
  };
}

/**
 * Calculate cost for fashion photoshoot generation
 * Fashion photoshoot is charged separately from the promo Gemini model
 * @param {number} numImages - Number of output images
 * @returns {number} Cost in credits
 */
export function calculateFashionPhotoshootCost(numImages = 1) {
  // Fashion photoshoot cost: 0.04M credits per image
  const FASHION_PHOTOSHOOT_COST_PER_IMAGE = 0.04 * 1000000; // 40,000 credits
  const safeNumImages = Math.max(1, Math.min(4, numImages));
  return FASHION_PHOTOSHOOT_COST_PER_IMAGE * safeNumImages;
}

// ============================================================================
// COMPOSITION HELPERS
// ============================================================================

/**
 * Prepares parameters for API request
 * @param {Object} rawParams - Raw parameters from client
 * @returns {Object} { valid: boolean, params: Object, errors: string[], cost: number }
 */
export function prepareGeminiRequest(rawParams) {
  // Handle description field (some tools use description instead of prompt)
  const params = { ...rawParams };
  if (params.description && !params.prompt) {
    params.prompt = params.description;
  }

  // Filter and normalize
  const filtered = filterGeminiParams(params);
  const normalized = normalizeGeminiParams(filtered);

  // Validate
  const validation = validateGeminiParams(normalized);

  // Determine mode and calculate cost
  const { useEditMode } = determineGeminiMode(normalized);
  const cost = calculateGeminiCost(normalized.num_images, useEditMode);

  return {
    valid: validation.valid,
    params: normalized,
    errors: validation.errors,
    cost,
    useEditMode,
  };
}

/**
 * Processes complete Gemini request (validation + cost + request building)
 * @param {Object} rawParams - Raw parameters
 * @returns {Object} Complete request preparation result
 */
export function processGeminiRequest(rawParams) {
  const preparation = prepareGeminiRequest(rawParams);

  if (!preparation.valid) {
    return {
      success: false,
      errors: preparation.errors,
    };
  }

  const { request, useEditMode, mode, originalPrompt } = buildGeminiRequest(
    preparation.params
  );

  return {
    success: true,
    request,
    params: preparation.params,
    cost: preparation.cost,
    useEditMode,
    mode,
    originalPrompt,
  };
}
