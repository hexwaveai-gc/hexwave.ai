/**
 * Pure functions for Wan 2.5 model operations
 * All functions are pure - no side effects, same input = same output
 * This is the single source of truth for Wan 2.5 operations
 */

import wan25Settings from "./settings";

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
const WAN25_BASE_COST_PER_IMAGE = 50000;

/**
 * Cost for image editing operations (same as generation for Wan 2.5)
 */
const WAN25_EDIT_COST = 50000;

/**
 * Image size presets mapped to API format
 * Wan 2.5 accepts these exact preset values
 */
const IMAGE_SIZE_PRESETS = {
  square_hd: "square_hd",
  landscape_16_9: "landscape_16_9",
  portrait_16_9: "portrait_16_9",
  portrait_4_3: "portrait_4_3",
  landscape_4_3: "landscape_4_3",
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates Wan 2.5 parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateWan25Params(params) {
  const errors = [];

  // Validate prompt
  if (!params.prompt) {
    errors.push("Prompt is required");
  } else if (params.prompt.length > 2000) {
    errors.push("Prompt must be less than 2000 characters");
  }

  // Validate negative prompt
  if (params.negative_prompt && params.negative_prompt.length > 500) {
    errors.push("Negative prompt must be less than 500 characters");
  }

  // Validate number of images
  if (params.num_images !== undefined) {
    const num = parseInt(params.num_images);
    if (
      isNaN(num) ||
      num < wan25Settings.num_images.min ||
      num > wan25Settings.num_images.max
    ) {
      errors.push(
        `Number of images must be between ${wan25Settings.num_images.min} and ${wan25Settings.num_images.max}`
      );
    }
  }

  // Validate image size for custom dimensions
  if (
    typeof params.image_size === "object" &&
    params.image_size.width &&
    params.image_size.height
  ) {
    const { width, height } = params.image_size;

    // Check if this is edit mode (has reference images)
    const isEditMode = params.image_urls && params.image_urls.length > 0;

    if (isEditMode) {
      // Image-to-image mode: Width and height must be between 384 and 5000 pixels
      if (width < 384 || width > 5000) {
        errors.push(
          "Width must be between 384 and 5000 pixels for image editing"
        );
      }
      if (height < 384 || height > 5000) {
        errors.push(
          "Height must be between 384 and 5000 pixels for image editing"
        );
      }
    } else {
      // Text-to-image mode: Total pixels between 768×768 and 1440×1440, aspect ratio [1:4, 4:1]
      const totalPixels = width * height;
      const minPixels = 768 * 768;
      const maxPixels = 1440 * 1440;

      if (totalPixels < minPixels || totalPixels > maxPixels) {
        errors.push("Total pixels must be between 768×768 and 1440×1440");
      }

      // Check aspect ratio constraint [1:4, 4:1]
      const aspectRatio = width / height;
      if (aspectRatio < 0.25 || aspectRatio > 4) {
        errors.push("Aspect ratio must be between 1:4 and 4:1");
      }
    }
  }

  // Validate reference images for edit mode
  if (params.image_urls?.length > wan25Settings.image_urls.max_files) {
    errors.push(
      `Maximum ${wan25Settings.image_urls.max_files} reference images allowed`
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
 * Calculates the cost for Wan 2.5 generation
 * @param {number} numImages - Number of images to generate
 * @param {boolean} isEdit - Whether this is an edit operation
 * @returns {number} Cost in credits
 */
export function calculateWan25Cost(numImages = 1, isEdit = false) {
  const safeNumImages = Math.max(
    wan25Settings.num_images.min,
    Math.min(wan25Settings.num_images.max, numImages)
  );

  // Edit and generation have the same cost for Wan 2.5
  const baseCostPerImage = isEdit ? WAN25_EDIT_COST : WAN25_BASE_COST_PER_IMAGE;

  // Apply platform fee
  return Math.round(baseCostPerImage * PLATFORM_FEE_MULTIPLIER * safeNumImages);
}

// ============================================================================
// PARAMETER MAPPING FUNCTIONS
// ============================================================================

/**
 * Maps image size to Wan 2.5 format for API calls
 * @param {string|Object} input - Image size input
 * @returns {string|Object} Wan 2.5 formatted image size
 */
export function mapToWan25ImageSize(input) {
  if (!input) return wan25Settings.image_size.default;

  // If it's already an object with width and height, return it
  if (typeof input === "object" && input.width && input.height) {
    return {
      width: parseInt(input.width),
      height: parseInt(input.height),
    };
  }

  // If it's a string preset that Wan 2.5 recognizes, return it
  if (typeof input === "string" && IMAGE_SIZE_PRESETS[input]) {
    return IMAGE_SIZE_PRESETS[input];
  }

  // Common aspect ratio mappings to Wan 2.5 presets
  const aspectRatioMap = {
    "1:1": "square_hd",
    "16:9": "landscape_16_9",
    "9:16": "portrait_16_9",
    "4:3": "landscape_4_3",
    "3:4": "portrait_4_3",
    square: "square_hd", // Use square_hd instead of just square
    portrait: "portrait_16_9",
    landscape: "landscape_16_9",
    // These are already exact matches
    square_hd: "square_hd",
    landscape_4_3: "landscape_4_3",
    portrait_4_3: "portrait_4_3",
  };

  return aspectRatioMap[input] || wan25Settings.image_size.default;
}

/**
 * Normalizes parameters for Wan 2.5
 * @param {Object} params - Raw parameters
 * @returns {Object} Normalized parameters with defaults
 */
export function normalizeWan25Params(params) {
  const hasReferenceImages =
    (params.image_urls && params.image_urls.length > 0) ||
    (params.uploadedImages && params.uploadedImages.length > 0);

  return {
    prompt: params.prompt || params.description || "",
    negative_prompt: params.negative_prompt || "",
    num_images:
      parseInt(params.num_images || params.numImages) ||
      wan25Settings.num_images.default,
    image_size: mapToWan25ImageSize(
      params.image_size || params.imageSize || params.aspectRatio
    ),
    enable_prompt_expansion:
      params.enable_prompt_expansion !== undefined
        ? params.enable_prompt_expansion
        : wan25Settings.enable_prompt_expansion.default,
    seed: params.seed ? parseInt(params.seed) : undefined,
    image_urls:
      params.image_urls ||
      params.uploadedImages?.map((img) =>
        typeof img === "string" ? img : img.cdnUrl || img.url
      ) ||
      [],
    uploadedImages: params.uploadedImages || [],
  };
}

// ============================================================================
// REQUEST BUILDER FUNCTIONS
// ============================================================================

/**
 * Determines if request should use edit mode
 * @param {Object} params - Normalized parameters
 * @returns {Object} { useEditMode: boolean, reason: string }
 */
export function determineWan25Mode(params) {
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
 * Builds Wan 2.5 generation request (standard mode)
 * @param {Object} params - Normalized parameters
 * @returns {Object} Wan generation request
 */
export function buildWan25GenerateRequest(params) {
  const request = {
    prompt: params.prompt,
    num_images: params.num_images,
    image_size: params.image_size,
    enable_prompt_expansion: params.enable_prompt_expansion,
  };

  // Add optional parameters
  if (params.negative_prompt) {
    request.negative_prompt = params.negative_prompt;
  }

  if (params.seed !== undefined) {
    request.seed = params.seed;
  }

  return request;
}

/**
 * Builds Wan 2.5 edit request (image-to-image mode)
 * @param {Object} params - Normalized parameters
 * @returns {Object} Wan edit request
 */
export function buildWan25EditRequest(params) {
  const request = {
    prompt: params.prompt,
    image_urls: params.image_urls,
    image_size: params.image_size,
    num_images: params.num_images,
  };

  // Add optional parameters
  if (params.negative_prompt) {
    request.negative_prompt = params.negative_prompt;
  }

  if (params.seed !== undefined) {
    request.seed = params.seed;
  }

  // Note: enable_prompt_expansion is not available in edit mode
  return request;
}

/**
 * Builds complete Wan 2.5 request based on mode
 * @param {Object} params - Normalized parameters
 * @returns {Object} { request, useEditMode, mode }
 */
export function buildWan25Request(params) {
  const normalized = normalizeWan25Params(params);
  const { useEditMode, reason } = determineWan25Mode(normalized);

  const request = useEditMode
    ? buildWan25EditRequest(normalized)
    : buildWan25GenerateRequest(normalized);

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
 * Transforms Wan 2.5 response to standard format
 * @param {Object} response - Wan API response
 * @returns {Array} Array of image URLs
 */
export function transformWan25Response(response) {
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets default parameters for Wan 2.5
 * @returns {Object} Default parameters
 */
export function getWan25Defaults() {
  return {
    prompt: "",
    negative_prompt: "",
    num_images: wan25Settings.num_images.default,
    image_size: wan25Settings.image_size.presets.default, // Use presets.default not image_size.default
    enable_prompt_expansion: wan25Settings.enable_prompt_expansion.default,
    seed: undefined,
  };
}

/**
 * Prepares parameters for API request
 * @param {Object} rawParams - Raw parameters from client
 * @returns {Object} { valid: boolean, params: Object, errors: string[], cost: number }
 */
export function prepareWan25Request(rawParams) {
  // Handle description field (some tools use description instead of prompt)
  const params = { ...rawParams };
  if (params.description && !params.prompt) {
    params.prompt = params.description;
  }

  // Normalize
  const normalized = normalizeWan25Params(params);

  // Validate
  const validation = validateWan25Params(normalized);

  // Determine mode and calculate cost
  const { useEditMode } = determineWan25Mode(normalized);
  const cost = calculateWan25Cost(normalized.num_images, useEditMode);

  return {
    valid: validation.valid,
    params: normalized,
    errors: validation.errors,
    cost,
    useEditMode,
  };
}
