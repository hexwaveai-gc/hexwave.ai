/**
 * Pure functions for Reve model operations
 * All functions are pure - no side effects, same input = same output
 * This is the single source of truth for Reve operations
 */

import reveSettings from "./settings";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Platform fee multiplier for all image generation
 */
const PLATFORM_FEE_MULTIPLIER = 0.769;

/**
 * Base cost per image in credits (1M credits = $1)
 * 0.04 * 1000000 = 40000
 */
const REVE_BASE_COST_PER_IMAGE = 40000;

/**
 * Cost for remix operations (same as text-to-image for Reve)
 */
const REVE_REMIX_COST = 40000;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates Reve parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateReveParams(params) {
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
      num < reveSettings.num_images.min ||
      num > reveSettings.num_images.max
    ) {
      errors.push(
        `Number of images must be between ${reveSettings.num_images.min} and ${reveSettings.num_images.max}`
      );
    }
  }

  // Validate aspect ratio
  if (params.aspect_ratio) {
    const validValues = reveSettings.aspect_ratio.options.map(
      (opt) => opt.value
    );
    if (!validValues.includes(params.aspect_ratio)) {
      errors.push(
        `Invalid aspect ratio. Must be one of: ${validValues.join(", ")}`
      );
    }
  }

  // Validate output format
  if (
    params.output_format &&
    !reveSettings.output_format.options.includes(params.output_format)
  ) {
    errors.push(
      `Invalid output format. Must be one of: ${reveSettings.output_format.options.join(", ")}`
    );
  }

  // Validate reference images for remix mode
  if (params.image_urls && params.image_urls.length > 0) {
    if (params.image_urls.length < reveSettings.image_urls.min_files) {
      errors.push(
        `Remix mode requires at least ${reveSettings.image_urls.min_files} reference image`
      );
    }
    if (params.image_urls.length > reveSettings.image_urls.max_files) {
      errors.push(
        `Maximum ${reveSettings.image_urls.max_files} reference images allowed for remix mode`
      );
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
 * Calculates the cost for Reve generation
 * @param {number} numImages - Number of images to generate
 * @param {boolean} isRemix - Whether this is a remix operation
 * @returns {number} Cost in credits
 */
export function calculateReveCost(numImages = 1, isRemix = false) {
  const safeNumImages = Math.max(
    reveSettings.num_images.min,
    Math.min(reveSettings.num_images.max, numImages)
  );

  // Remix and text-to-image have the same cost for Reve
  const baseCostPerImage = isRemix ? REVE_REMIX_COST : REVE_BASE_COST_PER_IMAGE;

  // Apply platform fee
  return Math.round(baseCostPerImage * PLATFORM_FEE_MULTIPLIER * safeNumImages);
}

/**
 * Calculates cost per single image (for compatibility)
 * @param {boolean} isRemix - Whether this is a remix operation
 * @returns {number} Cost in credits for one image
 */
export function calculateReveCostPerImage(isRemix = false) {
  return calculateReveCost(1, isRemix);
}

// ============================================================================
// PARAMETER MAPPING FUNCTIONS
// ============================================================================

/**
 * Maps common aspect ratios to Reve format
 * @param {string} aspectRatio - Input aspect ratio
 * @returns {string} Reve aspect ratio string
 */
export function mapToReveAspectRatio(aspectRatio) {
  if (!aspectRatio) return reveSettings.aspect_ratio.default;

  // Get valid aspect ratio values
  const validValues = reveSettings.aspect_ratio.options.map((opt) => opt.value);

  // If it's already a valid Reve aspect ratio, return as-is
  if (validValues.includes(aspectRatio)) {
    return aspectRatio;
  }

  // Map common variations to Reve aspect ratios
  const aspectRatioMap = {
    // Square formats
    "1:1": "1:1",
    square: "1:1",
    "1024x1024": "1:1",
    "1280x1280": "1:1",

    // Landscape formats
    "16:9": "16:9",
    "1820x1024": "16:9",
    landscape: "16:9",

    "3:2": "3:2",
    "1536x1024": "3:2",

    "4:3": "4:3",
    "1365x1024": "4:3",

    // Portrait formats
    "9:16": "9:16",
    "1024x1820": "9:16",
    portrait: "9:16",

    "2:3": "2:3",
    "1024x1536": "2:3",

    "3:4": "3:4",
    "1024x1365": "3:4",

    // Special cases
    auto: reveSettings.aspect_ratio.default,
  };

  return aspectRatioMap[aspectRatio] || reveSettings.aspect_ratio.default;
}

/**
 * Normalizes parameters for Reve
 * @param {Object} params - Raw parameters
 * @returns {Object} Normalized parameters with defaults
 */
export function normalizeReveParams(params) {
  const hasReferenceImages =
    (params.image_urls && params.image_urls.length > 0) ||
    (params.uploadedImages && params.uploadedImages.length > 0);

  return {
    prompt: params.prompt || params.description || "",
    num_images:
      parseInt(params.num_images || params.numImages) ||
      reveSettings.num_images.default,
    aspect_ratio: mapToReveAspectRatio(
      params.aspect_ratio || params.aspectRatio || params.imageSize
    ),
    output_format: params.output_format || reveSettings.output_format.default,
    sync_mode:
      params.sync_mode !== undefined
        ? params.sync_mode
        : reveSettings.sync_mode.default,
    image_urls:
      params.image_urls ||
      params.uploadedImages?.map((img) =>
        typeof img === "string" ? img : img.cdnUrl || img.url
      ) ||
      [],
    uploadedImages: params.uploadedImages || [],
  };
}

/**
 * Filters parameters to only include Reve relevant fields
 * @param {Object} params - Parameters object
 * @returns {Object} Filtered parameters
 */
export function filterReveParams(params) {
  // Return params without internal-only fields
  const { uploadedImages, ...filteredParams } = params;
  return filteredParams;
}

// ============================================================================
// REQUEST BUILDER FUNCTIONS
// ============================================================================

/**
 * Determines if request should use remix mode
 * @param {Object} params - Normalized parameters
 * @returns {Object} { useRemixMode: boolean, reason: string }
 */
export function determineReveMode(params) {
  // Reference images provided (1-4): Use remix mode
  if (
    params.image_urls?.length > 0 &&
    params.image_urls.length >= reveSettings.image_urls.min_files &&
    params.image_urls.length <= reveSettings.image_urls.max_files
  ) {
    return {
      useRemixMode: true,
      reason: "reference-images",
    };
  }

  // Default: Standard text-to-image generation
  return {
    useRemixMode: false,
    reason: "standard",
  };
}

/**
 * Builds Reve text-to-image request (standard mode)
 * @param {Object} params - Normalized parameters
 * @returns {Object} Reve text-to-image request
 */
export function buildReveTextToImageRequest(params) {
  const request = {
    prompt: params.prompt,
    num_images: params.num_images,
    aspect_ratio: params.aspect_ratio,
    output_format: params.output_format,
    sync_mode: params.sync_mode,
  };

  return request;
}

/**
 * Builds Reve remix request (remix mode with reference images)
 * @param {Object} params - Normalized parameters
 * @returns {Object} Reve remix request
 */
export function buildReveRemixRequest(params) {
  const request = {
    prompt: params.prompt,
    image_urls: params.image_urls,
    num_images: params.num_images,
    output_format: params.output_format,
    sync_mode: params.sync_mode,
  };

  // aspect_ratio is optional for remix mode (model will choose smartly)
  // but we can still include it if user specified
  if (params.aspect_ratio) {
    request.aspect_ratio = params.aspect_ratio;
  }

  return request;
}

/**
 * Builds complete Reve request based on mode
 * @param {Object} params - Normalized parameters
 * @returns {Object} { request, useRemixMode, mode }
 */
export function buildReveRequest(params) {
  const normalized = normalizeReveParams(params);
  const { useRemixMode, reason } = determineReveMode(normalized);

  const request = useRemixMode
    ? buildReveRemixRequest(normalized)
    : buildReveTextToImageRequest(normalized);

  return {
    request,
    useRemixMode,
    mode: reason,
  };
}

// ============================================================================
// RESPONSE TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transforms Reve response to standard format
 * @param {Object} response - Reve API response
 * @returns {Array} Array of image URLs
 */
export function transformReveResponse(response) {
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
 * Validates Reve response
 * @param {Object} response - Reve API response
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateReveResponse(response) {
  const errors = [];

  if (!response) {
    errors.push("No response received from Reve");
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
 * Gets default parameters for Reve
 * @returns {Object} Default parameters
 */
export function getReveDefaults() {
  return {
    prompt: "",
    num_images: reveSettings.num_images.default,
    aspect_ratio: reveSettings.aspect_ratio.default,
    output_format: reveSettings.output_format.default,
    sync_mode: reveSettings.sync_mode.default,
  };
}

/**
 * Checks if a model is Reve
 * @param {string} model - Model name
 * @returns {boolean} True if Reve
 */
export function isReveModel(model) {
  return model === "reve" || model === "fal-ai-reve";
}

/**
 * Estimates cost for client-side display
 * @param {Object} params - Parameters
 * @returns {number} Estimated cost in credits
 */
export function estimateReveCost(params) {
  const normalized = normalizeReveParams(params);
  const { useRemixMode } = determineReveMode(normalized);
  return calculateReveCost(normalized.num_images, useRemixMode);
}

/**
 * Gets aspect ratio options for UI
 * @returns {Array} Array of { value, label } objects
 */
export function getAspectRatioOptions() {
  return reveSettings.aspect_ratio.options;
}

// ============================================================================
// COMPOSITION HELPERS
// ============================================================================

/**
 * Prepares parameters for API request
 * @param {Object} rawParams - Raw parameters from client
 * @returns {Object} { valid: boolean, params: Object, errors: string[], cost: number }
 */
export function prepareReveRequest(rawParams) {
  // Handle description field (some tools use description instead of prompt)
  const params = { ...rawParams };
  if (params.description && !params.prompt) {
    params.prompt = params.description;
  }

  // Filter and normalize
  const filtered = filterReveParams(params);
  const normalized = normalizeReveParams(filtered);

  // Validate
  const validation = validateReveParams(normalized);

  // Determine mode and calculate cost
  const { useRemixMode } = determineReveMode(normalized);
  const cost = calculateReveCost(normalized.num_images, useRemixMode);

  return {
    valid: validation.valid,
    params: normalized,
    errors: validation.errors,
    cost,
    useRemixMode,
  };
}

/**
 * Processes complete Reve request (validation + cost + request building)
 * @param {Object} rawParams - Raw parameters
 * @returns {Object} Complete request preparation result
 */
export function processReveRequest(rawParams) {
  const preparation = prepareReveRequest(rawParams);

  if (!preparation.valid) {
    return {
      success: false,
      errors: preparation.errors,
    };
  }

  const { request, useRemixMode, mode } = buildReveRequest(preparation.params);

  return {
    success: true,
    request,
    params: preparation.params,
    cost: preparation.cost,
    useRemixMode,
    mode,
  };
}
