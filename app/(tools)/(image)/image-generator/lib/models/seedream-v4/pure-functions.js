/**
 * Pure functions for Seedream V4 model operations
 * All functions are pure - no side effects, same input = same output
 * This is the single source of truth for Seedream V4 operations
 */

import seedreamV4Settings from "./settings";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Platform fee multiplier for all image generation
 */
const PLATFORM_FEE_MULTIPLIER = 0.769;

/**
 * Base cost per image in credits (1M credits = $1)
 * From model-configs.js: 0.03 * 1000000 = 30000
 */
const SEEDREAM_BASE_COST_PER_IMAGE = 30000;

/**
 * Cost for image editing operations (same as generation for Seedream V4)
 */
const SEEDREAM_EDIT_COST = 30000;

/**
 * Image size presets mapped to dimensions
 */
const IMAGE_SIZE_PRESETS = {
  square_hd: { width: 1280, height: 1280 },
  square_xl: { width: 2048, height: 2048 },
  portrait_4_3: { width: 1024, height: 1365 },
  portrait_16_9: { width: 1024, height: 1820 },
  landscape_4_3: { width: 1365, height: 1024 },
  landscape_16_9: { width: 1820, height: 1024 },
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates Seedream V4 parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateSeedreamParams(params) {
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
      num < seedreamV4Settings.num_images.min ||
      num > seedreamV4Settings.num_images.max
    ) {
      errors.push(
        `Number of images must be between ${seedreamV4Settings.num_images.min} and ${seedreamV4Settings.num_images.max}`
      );
    }
  }

  // Validate image size for custom dimensions
  if (typeof params.image_size === "object") {
    const { width, height } = params.image_size;
    const settings = seedreamV4Settings.image_size.custom;

    if (!width || !height) {
      errors.push("Width and height are required for custom size");
    } else {
      if (width < settings.width.min || width > settings.width.max) {
        errors.push(
          `Width must be between ${settings.width.min} and ${settings.width.max}`
        );
      }
      if (height < settings.height.min || height > settings.height.max) {
        errors.push(
          `Height must be between ${settings.height.min} and ${settings.height.max}`
        );
      }
    }
  }

  // Validate reference images
  if (params.image_urls?.length > seedreamV4Settings.image_urls.max_files) {
    errors.push(
      `Maximum ${seedreamV4Settings.image_urls.max_files} reference images allowed`
    );
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
 * Calculates the cost for Seedream V4 generation
 * @param {number} numImages - Number of images to generate
 * @param {boolean} isEdit - Whether this is an edit operation
 * @returns {number} Cost in credits
 */
export function calculateSeedreamCost(numImages = 1, isEdit = false) {
  const safeNumImages = Math.max(
    seedreamV4Settings.num_images.min,
    Math.min(seedreamV4Settings.num_images.max, numImages)
  );

  // Edit and generation have the same cost for Seedream V4
  const baseCostPerImage = isEdit
    ? SEEDREAM_EDIT_COST
    : SEEDREAM_BASE_COST_PER_IMAGE;

  // Apply platform fee
  return Math.round(baseCostPerImage * PLATFORM_FEE_MULTIPLIER * safeNumImages);
}

/**
 * Calculates cost per single image (for compatibility)
 * @param {boolean} isEdit - Whether this is an edit operation
 * @returns {number} Cost in credits for one image
 */
export function calculateSeedreamCostPerImage(isEdit = false) {
  return calculateSeedreamCost(1, isEdit);
}

// ============================================================================
// PARAMETER MAPPING FUNCTIONS
// ============================================================================

/**
 * Maps aspect ratio to Seedream V4 preset string for UI
 * @param {string} aspectRatio - Input aspect ratio (e.g., "16:9", "1024x1024", "square")
 * @returns {string} Seedream V4 preset string (e.g., "square_hd", "landscape_16_9")
 */
export function mapToSeedreamAspectRatio(aspectRatio) {
  if (!aspectRatio) return seedreamV4Settings.image_size.presets.default;

  // Handle object format (custom dimensions)
  if (
    typeof aspectRatio === "object" &&
    aspectRatio.width &&
    aspectRatio.height
  ) {
    return "custom";
  }

  // If it's already a Seedream preset, return as-is
  if (
    typeof aspectRatio === "string" &&
    seedreamV4Settings.image_size.presets.options.includes(aspectRatio)
  ) {
    return aspectRatio;
  }

  // Map common aspect ratios to Seedream presets
  const aspectRatioToPresetMap = {
    // Square formats
    "1:1": "square_hd",
    square: "square_hd",
    "1024x1024": "square_hd",
    "1280x1280": "square_hd",

    // Landscape formats
    "4:3": "landscape_4_3",
    "1365x1024": "landscape_4_3",
    "1536x1024": "landscape_4_3", // GPT landscape -> closest match
    landscape: "landscape_4_3",

    "16:9": "landscape_16_9",
    "1820x1024": "landscape_16_9",

    // Portrait formats
    "3:4": "portrait_4_3",
    "1024x1365": "portrait_4_3",
    "1024x1536": "portrait_4_3", // GPT portrait -> closest match
    portrait: "portrait_4_3",

    "9:16": "portrait_16_9",
    "1024x1820": "portrait_16_9",

    // Special cases
    auto: "square_hd", // Default for auto
  };

  return (
    aspectRatioToPresetMap[aspectRatio] ||
    seedreamV4Settings.image_size.presets.default
  );
}

/**
 * Maps image size to Seedream V4 format for API calls
 * @param {string|Object} input - Image size input
 * @returns {Object} { width: number, height: number }
 */
export function mapToSeedreamImageSize(input) {
  if (!input) return seedreamV4Settings.image_size.default;

  // If it's already an object with width and height, return it
  if (typeof input === "object" && input.width && input.height) {
    return {
      width: parseInt(input.width),
      height: parseInt(input.height),
    };
  }

  // If it's a string preset, map it
  if (typeof input === "string") {
    return IMAGE_SIZE_PRESETS[input] || seedreamV4Settings.image_size.default;
  }

  // Common aspect ratio mappings
  const aspectRatioMap = {
    "1:1": IMAGE_SIZE_PRESETS.square_hd,
    "4:3": IMAGE_SIZE_PRESETS.landscape_4_3,
    "3:4": IMAGE_SIZE_PRESETS.portrait_4_3,
    "16:9": IMAGE_SIZE_PRESETS.landscape_16_9,
    "9:16": IMAGE_SIZE_PRESETS.portrait_16_9,
    square: IMAGE_SIZE_PRESETS.square_hd,
    portrait: IMAGE_SIZE_PRESETS.portrait_4_3,
    landscape: IMAGE_SIZE_PRESETS.landscape_4_3,
  };

  return aspectRatioMap[input] || seedreamV4Settings.image_size.default;
}

/**
 * Normalizes parameters for Seedream V4
 * @param {Object} params - Raw parameters
 * @returns {Object} Normalized parameters with defaults
 */
export function normalizeSeedreamParams(params) {
  const hasReferenceImages =
    (params.image_urls && params.image_urls.length > 0) ||
    (params.uploadedImages && params.uploadedImages.length > 0);

  return {
    prompt: params.prompt || params.description || "",
    num_images:
      parseInt(params.num_images || params.numImages) ||
      seedreamV4Settings.num_images.default,
    image_size: mapToSeedreamImageSize(
      params.image_size || params.imageSize || params.aspectRatio
    ),
    seed: params.seed ? parseInt(params.seed) : undefined,
    enable_safety_checker:
      params.enable_safety_checker !== undefined
        ? params.enable_safety_checker
        : seedreamV4Settings.enable_safety_checker.default,
    sync_mode:
      params.sync_mode !== undefined
        ? params.sync_mode
        : seedreamV4Settings.sync_mode.default,
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
 * Filters parameters to only include Seedream V4 relevant fields
 * @param {Object} params - Parameters object
 * @returns {Object} Filtered parameters
 */
export function filterSeedreamParams(params) {
  // Return all params except image_size (we use aspectRatio instead)
  const { image_size, ...filteredParams } = params;
  return filteredParams;
}

// ============================================================================
// REQUEST BUILDER FUNCTIONS
// ============================================================================

/**
 * Determines if request should use edit mode
 * @param {Object} params - Normalized parameters
 * @returns {Object} { useEditMode: boolean, reason: string }
 */
export function determineSeedreamMode(params) {
  // Reference images provided: Use edit mode
  if (params.image_urls?.length > 0) {
    return {
      useEditMode: true,
      reason: "reference-images",
    };
  }

  // Default: Standard generation
  return {
    useEditMode: false,
    reason: "standard",
  };
}

/**
 * Builds Seedream V4 generation request (standard mode)
 * @param {Object} params - Normalized parameters
 * @returns {Object} Seedream generation request
 */
export function buildSeedreamGenerateRequest(params) {
  const request = {
    prompt: params.prompt,
    num_images: params.num_images,
    image_size: params.image_size,
    enable_safety_checker: params.enable_safety_checker,
    sync_mode: params.sync_mode,
  };

  // Add seed if provided
  if (params.seed !== undefined) {
    request.seed = params.seed;
  }

  return request;
}

/**
 * Builds Seedream V4 edit request (edit mode with reference images)
 * @param {Object} params - Normalized parameters
 * @returns {Object} Seedream edit request
 */
export function buildSeedreamEditRequest(params) {
  const request = buildSeedreamGenerateRequest(params);

  // Add reference images for edit mode
  if (params.image_urls?.length > 0) {
    request.image_urls = params.image_urls;
  }

  return request;
}

/**
 * Builds complete Seedream V4 request based on mode
 * @param {Object} params - Normalized parameters
 * @returns {Object} { request, useEditMode, mode }
 */
export function buildSeedreamRequest(params) {
  const normalized = normalizeSeedreamParams(params);
  const { useEditMode, reason } = determineSeedreamMode(normalized);

  const request = useEditMode
    ? buildSeedreamEditRequest(normalized)
    : buildSeedreamGenerateRequest(normalized);

  return {
    request,
    useEditMode,
    mode: reason,
  };
}

// ============================================================================
// RESPONSE TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transforms Seedream V4 response to standard format
 * @param {Object} response - Seedream API response
 * @returns {Array} Array of image URLs
 */
export function transformSeedreamResponse(response) {
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
 * Validates Seedream V4 response
 * @param {Object} response - Seedream API response
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateSeedreamResponse(response) {
  const errors = [];

  if (!response) {
    errors.push("No response received from Seedream V4");
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
 * Gets default parameters for Seedream V4
 * @returns {Object} Default parameters
 */
export function getSeedreamDefaults() {
  return {
    prompt: "",
    num_images: seedreamV4Settings.num_images.default,
    image_size: seedreamV4Settings.image_size.presets.default, // Use preset string "square_hd", not object
    enable_safety_checker: seedreamV4Settings.enable_safety_checker.default,
    sync_mode: seedreamV4Settings.sync_mode.default,
    seed: undefined,
  };
}

/**
 * Checks if a model is Seedream V4
 * @param {string} model - Model name
 * @returns {boolean} True if Seedream V4
 */
export function isSeedreamModel(model) {
  return model === "seedream-v4" || model === "bytedance-seedream-v4";
}

/**
 * Estimates cost for client-side display
 * @param {Object} params - Parameters
 * @returns {number} Estimated cost in credits
 */
export function estimateSeedreamCost(params) {
  const normalized = normalizeSeedreamParams(params);
  const { useEditMode } = determineSeedreamMode(normalized);
  return calculateSeedreamCost(normalized.num_images, useEditMode);
}

/**
 * Gets image size options for UI
 * @returns {Array} Array of { value, label } objects
 */
export function getImageSizeOptions() {
  return seedreamV4Settings.image_size.presets.options
    .filter((option) => option !== "custom")
    .map((option) => {
      const labelMap = {
        square_hd: "Square HD (1280x1280)",
        square_xl: "Square XL (2048x2048)",
        portrait_4_3: "Portrait 4:3 (1024x1365)",
        portrait_16_9: "Portrait 16:9 (1024x1820)",
        landscape_4_3: "Landscape 4:3 (1365x1024)",
        landscape_16_9: "Landscape 16:9 (1820x1024)",
      };
      return {
        value: option,
        label: labelMap[option] || option,
      };
    });
}

// ============================================================================
// COMPOSITION HELPERS
// ============================================================================

/**
 * Prepares parameters for API request
 * @param {Object} rawParams - Raw parameters from client
 * @returns {Object} { valid: boolean, params: Object, errors: string[], cost: number }
 */
export function prepareSeedreamRequest(rawParams) {
  // Handle description field (some tools use description instead of prompt)
  const params = { ...rawParams };
  if (params.description && !params.prompt) {
    params.prompt = params.description;
  }

  // Filter and normalize
  const filtered = filterSeedreamParams(params);
  const normalized = normalizeSeedreamParams(filtered);

  // Validate
  const validation = validateSeedreamParams(normalized);

  // Determine mode and calculate cost
  const { useEditMode } = determineSeedreamMode(normalized);
  const cost = calculateSeedreamCost(normalized.num_images, useEditMode);

  return {
    valid: validation.valid,
    params: normalized,
    errors: validation.errors,
    cost,
    useEditMode,
  };
}

/**
 * Processes complete Seedream V4 request (validation + cost + request building)
 * @param {Object} rawParams - Raw parameters
 * @returns {Object} Complete request preparation result
 */
export function processSeedreamRequest(rawParams) {
  const preparation = prepareSeedreamRequest(rawParams);

  if (!preparation.valid) {
    return {
      success: false,
      errors: preparation.errors,
    };
  }

  const { request, useEditMode, mode } = buildSeedreamRequest(
    preparation.params
  );

  return {
    success: true,
    request,
    params: preparation.params,
    cost: preparation.cost,
    useEditMode,
    mode,
  };
}
