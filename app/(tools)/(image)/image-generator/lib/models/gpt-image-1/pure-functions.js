/**
 * Pure functions for GPT-Image-1 model operations
 * All functions are pure - no side effects, same input = same output
 * This is the single source of truth for GPT-Image-1 operations
 */

import { logWarn } from "@/lib/betterStack";
import { gptImage1Settings } from "./settings";
// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates GPT-Image-1 parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateGptImage1Params(params) {
  const errors = [];

  // Validate prompt
  if (!params.prompt) {
    errors.push("Prompt is required");
  } else if (params.prompt.length > gptImage1Settings.prompt.maxLength) {
    errors.push(
      `Prompt must be less than ${gptImage1Settings.prompt.maxLength} characters`
    );
  }

  // Validate size
  if (params.size && !gptImage1Settings.size.options.includes(params.size)) {
    errors.push(`Invalid size option: ${params.size}`);
  }

  // Validate quality
  if (
    params.quality &&
    !gptImage1Settings.quality.options.includes(params.quality)
  ) {
    errors.push(`Invalid quality option: ${params.quality}`);
  }

  // Validate background
  if (
    params.background &&
    !gptImage1Settings.background.options.includes(params.background)
  ) {
    errors.push(`Invalid background option: ${params.background}`);
  }

  // Validate input fidelity
  if (
    params.input_fidelity &&
    !gptImage1Settings.input_fidelity.options.includes(params.input_fidelity)
  ) {
    errors.push(`Invalid input fidelity option: ${params.input_fidelity}`);
  }

  // Validate numImages
  if (params.numImages) {
    if (params.numImages < 1 || params.numImages > 10) {
      errors.push("Number of images must be between 1 and 10");
    }
  }

  // Validate uploadedImages
  if (params.uploadedImages) {
    if (!Array.isArray(params.uploadedImages)) {
      errors.push("uploadedImages must be an array");
    } else if (params.uploadedImages.length > 5) {
      errors.push("Maximum 5 images can be uploaded");
    }
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
 * Platform fee multiplier for all image generation
 */
const PLATFORM_FEE_MULTIPLIER = 1;

/**
 * Base costs in credits (1,000,000 credits = $1) BEFORE platform fee
 * GPT-Image-1 (full model)
 */
const GPT_BASE_COSTS = {
  low: {
    "1024x1024": 11000, // $0.011
    "1024x1536": 16000, // $0.016
    "1536x1024": 16000, // $0.016
    auto: 16000, // Default to higher cost for auto
  },
  medium: {
    "1024x1024": 42000, // $0.042
    "1024x1536": 63000, // $0.063
    "1536x1024": 63000, // $0.063
    auto: 63000, // Default to higher cost for auto
  },
  high: {
    "1024x1024": 167000, // $0.167
    "1024x1536": 250000, // $0.25
    "1536x1024": 250000, // $0.25
    auto: 250000, // Default to highest cost for auto
  },
};

/**
 * Base costs in credits (1,000,000 credits = $1) BEFORE platform fee
 * GPT-Image-1-Mini (lower cost variant)
 */
const GPT_MINI_BASE_COSTS = {
  low: {
    "1024x1024": 5000, // $0.005
    "1024x1536": 6000, // $0.006
    "1536x1024": 6000, // $0.006
    auto: 6000, // Default to higher cost for auto
  },
  medium: {
    "1024x1024": 11000, // $0.011
    "1024x1536": 15000, // $0.015
    "1536x1024": 15000, // $0.015
    auto: 15000, // Default to higher cost for auto
  },
  high: {
    "1024x1024": 11000, // $0.011 (mini doesn't have high quality, use medium)
    "1024x1536": 15000, // $0.015
    "1536x1024": 15000, // $0.015
    auto: 15000, // Default to higher cost for auto
  },
};

/**
 * Fixed cost for image editing operations (as per current implementation)
 */
const GPT_IMAGE_EDIT_COST = 250000; // 0.25M credits

/**
 * Calculates the cost for GPT-Image-1 generation
 * @param {string} quality - Quality level (low, medium, high)
 * @param {string} size - Image size (e.g., "1024x1024", "auto")
 * @param {number} numImages - Number of images to generate
 * @param {boolean} isEdit - Whether this is an edit operation
 * @param {string} model - Model name (gpt-image-1 or gpt-image-1-mini)
 * @returns {number} Cost in credits
 */
export function calculateGptImage1Cost(
  quality = gptImage1Settings.quality.default,
  size = gptImage1Settings.size.default,
  numImages = 1,
  isEdit = false,
  model = "gpt-image-1"
) {
  // Image editing has a fixed cost
  if (isEdit) {
    return Math.round(GPT_IMAGE_EDIT_COST * PLATFORM_FEE_MULTIPLIER);
  }

  // Validate and sanitize inputs
  const safeQuality = gptImage1Settings.quality.options.includes(quality)
    ? quality
    : gptImage1Settings.quality.default;

  const safeSize = gptImage1Settings.size.options.includes(size)
    ? size
    : gptImage1Settings.size.default;

  const safeNumImages = Math.max(1, Math.min(10, numImages));

  // Choose the right cost table based on model
  const isMini = model === "gpt-image-1-mini";
  const costTable = isMini ? GPT_MINI_BASE_COSTS : GPT_BASE_COSTS;

  // Get base cost
  const baseCost = costTable[safeQuality]?.[safeSize];

  if (!baseCost) {
    // Fallback to highest cost if something unexpected happens
    logWarn(
      `Could not determine cost for quality '${safeQuality}' and size '${safeSize}'. Using highest cost.`
    );
    return Math.round(
      costTable.high[gptImage1Settings.size.default] *
        PLATFORM_FEE_MULTIPLIER *
        safeNumImages
    );
  }

  // Apply platform fee and multiply by number of images
  return Math.round(baseCost * PLATFORM_FEE_MULTIPLIER * safeNumImages);
}

/**
 * Calculates cost per single image (for compatibility)
 * @param {string} quality - Quality level
 * @param {string} size - Image size
 * @param {string} model - Model name (gpt-image-1 or gpt-image-1-mini)
 * @returns {number} Cost in credits for one image
 */
export function calculateGptImage1CostPerImage(
  quality,
  size,
  model = "gpt-image-1"
) {
  return calculateGptImage1Cost(quality, size, 1, false, model);
}

/**
 * Calculates the cost for GPT-Image-1 dual image editing (for dual image tools)
 * @param {boolean} isEdit - Whether this is an edit operation (always true for dual image tools)
 * @returns {number} Cost in credits for dual image editing
 */
export function calculateGptImage1DualImageCost(isEdit = true) {
  return calculateGptImage1Cost(
    gptImage1Settings.quality.default,
    gptImage1Settings.size.default,
    1,
    isEdit
  );
}

// ============================================================================
// PARAMETER MAPPING FUNCTIONS
// ============================================================================

/**
 * Maps aspect ratio to GPT-Image-1 size format
 * @param {string} aspectRatio - Common aspect ratio (e.g., "16:9", "1:1")
 * @returns {string} GPT-Image-1 size format (e.g., "1024x1024")
 */
export function mapAspectRatioToGptSize(aspectRatio) {
  // Handle object format (custom dimensions from Seedream)
  if (
    typeof aspectRatio === "object" &&
    aspectRatio.width &&
    aspectRatio.height
  ) {
    // GPT doesn't support custom dimensions, return auto
    return "auto";
  }

  // If already in GPT format, return as-is
  if (
    aspectRatio &&
    typeof aspectRatio === "string" &&
    aspectRatio.includes("x")
  ) {
    return aspectRatio;
  }

  const mappings = {
    "1:1": "1024x1024",
    "16:9": "1536x1024",
    "9:16": "1024x1536",
    "4:3": "1536x1024",
    "3:4": "1024x1536",
    "16:10": "1536x1024",
    "10:16": "1024x1536",
  };

  return mappings[aspectRatio] || "auto";
}

/**
 * Normalizes parameters for GPT-Image-1
 * @param {Object} params - Raw parameters
 * @returns {Object} Normalized parameters with defaults
 */
export function normalizeGptImage1Params(params) {
  // Determine size: prioritize params.size, then aspectRatio, then default
  let size = gptImage1Settings.size.default;
  if (params.size) {
    size = params.size;
  } else if (params.aspectRatio) {
    size = mapAspectRatioToGptSize(params.aspectRatio);
  }

  return {
    prompt: params.prompt || "",
    size: size,
    quality: params.quality || gptImage1Settings.quality.default,
    background: params.background || gptImage1Settings.background.default,
    input_fidelity:
      params.input_fidelity ||
      params.inputFidelity ||
      gptImage1Settings.input_fidelity.default,
    numImages: params.numImages || 1,
    uploadedImages: params.uploadedImages || null,
  };
}

/**
 * Filters parameters to only include GPT-Image-1 relevant fields
 * @param {Object} params - Parameters object
 * @returns {Object} Filtered parameters
 */
export function filterGptImage1Params(params) {
  // Simply return all params - let the backend handle what it needs
  // The backend already knows how to extract model-specific params
  // and pass the rest to tool-specific prompt enhancers
  return { ...params };
}

// ============================================================================
// REQUEST BUILDER FUNCTIONS
// ============================================================================

/**
 * Builds OpenAI API request for image generation
 * @param {Object} params - Normalized parameters
 * @returns {Object} OpenAI API request object
 */
export function buildGptImage1GenerateRequest(params) {
  const normalized = normalizeGptImage1Params(params);

  return {
    // Don't include model here - it's added by the route handler
    prompt: normalized.prompt,
    size: normalized.size === "auto" ? undefined : normalized.size,
    quality: normalized.quality,
    n: normalized.numImages,
  };
}

/**
 * Builds OpenAI API request for image editing
 * @param {Object} params - Normalized parameters
 * @returns {Object} OpenAI API request object
 */
export function buildGptImage1EditRequest(params) {
  const normalized = normalizeGptImage1Params(params);

  return {
    // Don't include model here - it's added by the route handler
    prompt: normalized.prompt,
    size: normalized.size === "auto" ? undefined : normalized.size,
    background: normalized.background,
    n: normalized.numImages,
    input_fidelity: normalized.input_fidelity,
  };
}

/**
 * Determines if request is for editing or generation
 * @param {Object} params - Parameters
 * @returns {boolean} True if edit operation
 */
export function isGptImage1EditOperation(params) {
  return !!(
    params.uploadedImages?.length > 0 ||
    params.inputImage ||
    params.image
  );
}

// ============================================================================
// RESPONSE TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transforms OpenAI response to standard format
 * @param {Object} response - OpenAI API response
 * @returns {Array} Array of image URLs or base64 data
 */
export function transformGptImage1Response(response) {
  if (!response?.data || !Array.isArray(response.data)) {
    return [];
  }

  return response.data.map((item) => {
    if (item.b64_json) {
      return `data:image/png;base64,${item.b64_json}`;
    }
    return item.url;
  });
}

/**
 * Validates OpenAI response
 * @param {Object} response - OpenAI API response
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateGptImage1Response(response) {
  const errors = [];

  if (!response) {
    errors.push("No response received from OpenAI");
  } else if (!response.data) {
    errors.push("Response missing data field");
  } else if (!Array.isArray(response.data)) {
    errors.push("Response data is not an array");
  } else if (response.data.length === 0) {
    errors.push("Response contains no images");
  } else {
    const invalidImages = response.data.filter(
      (img) => !img.b64_json && !img.url
    );
    if (invalidImages.length > 0) {
      errors.push(
        `${invalidImages.length} images missing both b64_json and url`
      );
    }
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
 * Gets default parameters for GPT-Image-1
 * @returns {Object} Default parameters
 */
export function getGptImage1Defaults() {
  return {
    prompt: "",
    size: gptImage1Settings.size.default,
    quality: gptImage1Settings.quality.default,
    background: gptImage1Settings.background.default,
    input_fidelity: gptImage1Settings.input_fidelity.default,
    numImages: 1,
  };
}

/**
 * Checks if a model is GPT-Image-1 or GPT-Image-1-Mini
 * @param {string} model - Model name
 * @returns {boolean} True if GPT-Image-1 or GPT-Image-1-Mini
 */
export function isGptImage1Model(model) {
  return (
    model === "gpt-image-1" ||
    model === "gpt-image-1-mini" ||
    model === gptImage1Settings.model.value
  );
}

/**
 * Estimates cost for client-side display
 * @param {Object} params - Parameters
 * @returns {number} Estimated cost in credits
 */
export function estimateGptImage1Cost(params) {
  const normalized = normalizeGptImage1Params(params);
  const isEdit = isGptImage1EditOperation(params);
  const model = params.model || "gpt-image-1";

  return calculateGptImage1Cost(
    normalized.quality,
    normalized.size,
    normalized.numImages,
    isEdit,
    model
  );
}

// ============================================================================
// COMPOSITION HELPERS
// ============================================================================

/**
 * Prepares parameters for API request
 * @param {Object} rawParams - Raw parameters from client
 * @returns {Object} { valid: boolean, params: Object, errors: string[], cost: number }
 */
export function prepareGptImage1Request(rawParams) {
  // Handle description field (some tools use description instead of prompt)
  const params = { ...rawParams };
  if (params.description && !params.prompt) {
    params.prompt = params.description;
  }

  // Filter and normalize
  const filtered = filterGptImage1Params(params);
  const normalized = normalizeGptImage1Params(filtered);

  // Validate
  const validation = validateGptImage1Params(normalized);

  // Calculate cost
  const isEdit = isGptImage1EditOperation(normalized);
  const model = params.model || "gpt-image-1";
  const cost = calculateGptImage1Cost(
    normalized.quality,
    normalized.size,
    normalized.numImages,
    isEdit,
    model
  );

  return {
    valid: validation.valid,
    params: normalized,
    errors: validation.errors,
    cost,
    isEdit,
    model,
  };
}

/**
 * Processes complete GPT-Image-1 request (validation + cost + request building)
 * @param {Object} rawParams - Raw parameters
 * @returns {Object} Complete request preparation result
 */
export function processGptImage1Request(rawParams) {
  const preparation = prepareGptImage1Request(rawParams);

  if (!preparation.valid) {
    return {
      success: false,
      errors: preparation.errors,
    };
  }

  const request = preparation.isEdit
    ? buildGptImage1EditRequest(preparation.params)
    : buildGptImage1GenerateRequest(preparation.params);

  return {
    success: true,
    request,
    params: preparation.params,
    cost: preparation.cost,
    isEdit: preparation.isEdit,
  };
}
