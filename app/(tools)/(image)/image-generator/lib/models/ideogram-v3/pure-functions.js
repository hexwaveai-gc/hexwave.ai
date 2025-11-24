/**
 * Pure functions for Ideogram V3 model operations
 * All functions are pure - no side effects, same input = same output
 * This is the single source of truth for Ideogram V3 operations
 */

import ideogramV3Settings from "./settings";
import { logWarn } from "@/lib/betterStack";
// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Platform fee multiplier for all image generation
 */
const PLATFORM_FEE_MULTIPLIER = 0.769;

/**
 * Cost per image based on rendering speed (in credits, 1M credits = $1)
 */
const IDEOGRAM_V3_COSTS = {
  TURBO: 30000, // $0.03 per image
  BALANCED: 60000, // $0.06 per image
  QUALITY: 90000, // $0.09 per image
};

/**
 * Aspect ratio to image size mappings
 */
const ASPECT_RATIO_TO_IMAGE_SIZE = {
  // Common aspect ratios
  "1:1": "square_hd",
  "16:9": "landscape_16_9",
  "9:16": "portrait_16_9",
  "4:3": "landscape_4_3",
  "3:4": "portrait_4_3",
  "16:10": "landscape_16_9", // closest match
  "10:16": "portrait_16_9", // closest match
  // Legacy pixel dimensions
  "1024x1024": "square_hd",
  "1792x1024": "landscape_16_9",
  "1024x1792": "portrait_16_9",
  // Direct V3 values (pass through)
  square_hd: "square_hd",
  square: "square",
  portrait_4_3: "portrait_4_3",
  portrait_16_9: "portrait_16_9",
  landscape_4_3: "landscape_4_3",
  landscape_16_9: "landscape_16_9",
};

/**
 * Style value mappings (handles both uppercase and lowercase)
 */
const STYLE_MAPPINGS = {
  // V3 direct mappings (uppercase)
  AUTO: "AUTO",
  GENERAL: "GENERAL",
  REALISTIC: "REALISTIC",
  DESIGN: "DESIGN",
  // Legacy lowercase mappings
  auto: "AUTO",
  general: "GENERAL",
  realistic: "REALISTIC",
  design: "DESIGN",
  // Other model mappings
  render_3D: "REALISTIC",
  anime: "GENERAL",
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates Ideogram V3 parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateIdeogramV3Params(params) {
  const errors = [];

  // Validate prompt
  if (!params.prompt) {
    errors.push("Prompt is required");
  }

  // Validate rendering speed
  if (
    params.rendering_speed &&
    !ideogramV3Settings.rendering_speed.options.includes(params.rendering_speed)
  ) {
    errors.push(`Invalid rendering speed: ${params.rendering_speed}`);
  }

  // Validate style
  if (
    params.style &&
    !ideogramV3Settings.style.options.includes(params.style)
  ) {
    errors.push(`Invalid style: ${params.style}`);
  }

  // Validate num_images
  if (params.num_images) {
    const num = parseInt(params.num_images);
    if (
      isNaN(num) ||
      num < ideogramV3Settings.num_images.min ||
      num > ideogramV3Settings.num_images.max
    ) {
      errors.push(
        `Number of images must be between ${ideogramV3Settings.num_images.min} and ${ideogramV3Settings.num_images.max}`
      );
    }
  }

  // Validate image_size
  if (params.image_size) {
    const validSizes = Object.values(ASPECT_RATIO_TO_IMAGE_SIZE);
    if (!validSizes.includes(params.image_size)) {
      errors.push(`Invalid image size: ${params.image_size}`);
    }
  }

  // Validate style conflicts
  if (params.image_urls?.length > 0 || params.uploadedImages?.length > 0) {
    if (params.style && params.style !== "AUTO") {
      errors.push("Style must be AUTO when using reference images");
    }
    if (params.style_codes?.length > 0) {
      errors.push("Cannot use both reference images and style codes");
    }
  }

  // Validate style codes
  if (params.style_codes?.length > 5) {
    errors.push("Maximum 5 style codes allowed");
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
 * Calculates the cost for Ideogram V3 generation
 * @param {string} renderingSpeed - Rendering speed (TURBO, BALANCED, QUALITY)
 * @param {number} numImages - Number of images to generate
 * @returns {number} Cost in credits
 */
export function calculateIdeogramV3Cost(
  renderingSpeed = ideogramV3Settings.rendering_speed.default,
  numImages = 1
) {
  // Validate and sanitize inputs
  const safeSpeed = ideogramV3Settings.rendering_speed.options.includes(
    renderingSpeed
  )
    ? renderingSpeed
    : ideogramV3Settings.rendering_speed.default;

  const safeNumImages = Math.max(
    ideogramV3Settings.num_images.min,
    Math.min(ideogramV3Settings.num_images.max, numImages)
  );

  // Get base cost
  const baseCostPerImage = IDEOGRAM_V3_COSTS[safeSpeed];

  if (!baseCostPerImage) {
    logWarn(
      `Could not determine cost for rendering speed '${safeSpeed}'. Using QUALITY cost.`
    );
    return Math.round(
      IDEOGRAM_V3_COSTS.QUALITY * PLATFORM_FEE_MULTIPLIER * safeNumImages
    );
  }

  // Apply platform fee and multiply by number of images
  return Math.round(baseCostPerImage * PLATFORM_FEE_MULTIPLIER * safeNumImages);
}

/**
 * Calculates cost per single image (for compatibility)
 * @param {string} renderingSpeed - Rendering speed
 * @returns {number} Cost in credits for one image
 */
export function calculateIdeogramV3CostPerImage(renderingSpeed) {
  return calculateIdeogramV3Cost(renderingSpeed, 1);
}

// ============================================================================
// PARAMETER MAPPING FUNCTIONS
// ============================================================================

/**
 * Maps aspect ratio or dimension to Ideogram V3 image size format
 * @param {string} input - Aspect ratio, dimension, or V3 size
 * @returns {string} Ideogram V3 image size format
 */
export function mapToIdeogramV3ImageSize(input) {
  if (!input) return ideogramV3Settings.image_size.presets.default;

  // Handle object format (custom dimensions)
  if (typeof input === "object" && input.width && input.height) {
    // Return the object as-is for custom dimensions
    return {
      width: parseInt(input.width),
      height: parseInt(input.height),
    };
  }

  // Handle string presets
  if (
    typeof input === "string" &&
    ideogramV3Settings.image_size.presets.options.includes(input)
  ) {
    return input;
  }

  return (
    ASPECT_RATIO_TO_IMAGE_SIZE[input] ||
    ideogramV3Settings.image_size.presets.default
  );
}

/**
 * Maps style value to Ideogram V3 style format
 * @param {string} style - Style value (can be lowercase or uppercase)
 * @param {boolean} hasReferenceImages - Whether reference images are present
 * @returns {string} Ideogram V3 style format
 */
export function mapToIdeogramV3Style(style, hasReferenceImages = false) {
  // When using reference images, style must be AUTO
  if (hasReferenceImages) {
    return "AUTO";
  }

  if (!style) return ideogramV3Settings.style.default;

  return STYLE_MAPPINGS[style] || STYLE_MAPPINGS[style.toLowerCase()] || "AUTO";
}

/**
 * Normalizes parameters for Ideogram V3
 * @param {Object} params - Raw parameters
 * @returns {Object} Normalized parameters with defaults
 */
export function normalizeIdeogramV3Params(params) {
  const hasReferenceImages =
    (params.uploadedImages && params.uploadedImages.length > 0) ||
    (params.image_urls && params.image_urls.length > 0);

  return {
    prompt: params.prompt || params.description || "",
    negative_prompt: params.negative_prompt || params.negativePrompt || "",
    rendering_speed:
      params.rendering_speed ||
      params.renderingSpeed ||
      ideogramV3Settings.rendering_speed.default,
    style: mapToIdeogramV3Style(
      params.style || params.modelStyle,
      hasReferenceImages
    ),
    image_size: mapToIdeogramV3ImageSize(
      params.image_size || params.imageSize || params.aspectRatio
    ),
    num_images:
      parseInt(params.num_images || params.numImages) ||
      ideogramV3Settings.num_images.default,
    expand_prompt:
      params.expand_prompt !== undefined
        ? params.expand_prompt
        : ideogramV3Settings.expand_prompt.default,
    seed: params.seed || undefined,
    image_urls:
      params.image_urls ||
      params.uploadedImages?.map((img) => img.cdnUrl || img) ||
      undefined,
    style_codes: params.style_codes || undefined,
    color_palette: params.color_palette || undefined,
  };
}

/**
 * Filters parameters to only include Ideogram V3 relevant fields
 * @param {Object} params - Parameters object
 * @returns {Object} Filtered parameters
 */
export function filterIdeogramV3Params(params) {
  // Simply return all params - let the backend handle what it needs
  // The backend already knows how to extract model-specific params
  // and pass the rest to tool-specific prompt enhancers
  return { ...params };
}

// ============================================================================
// REQUEST BUILDER FUNCTIONS
// ============================================================================

/**
 * Builds Ideogram V3 API request
 * @param {Object} params - Normalized parameters
 * @returns {Object} Ideogram V3 API request object
 */
export function buildIdeogramV3Request(params) {
  const normalized = normalizeIdeogramV3Params(params);

  // Build base request
  const request = {
    prompt: normalized.prompt,
    image_size: normalized.image_size,
    num_images: normalized.num_images,
    rendering_speed: normalized.rendering_speed,
    expand_prompt: normalized.expand_prompt,
    style: normalized.style,
  };

  // Add optional parameters
  if (normalized.negative_prompt) {
    request.negative_prompt = normalized.negative_prompt;
  }

  if (normalized.seed !== undefined) {
    request.seed = normalized.seed;
  }

  if (normalized.image_urls && normalized.image_urls.length > 0) {
    request.image_urls = normalized.image_urls;
    // Force style to AUTO when using reference images
    request.style = "AUTO";
  }

  if (normalized.style_codes && normalized.style_codes.length > 0) {
    request.style_codes = normalized.style_codes;
  }

  if (normalized.color_palette) {
    request.color_palette = normalized.color_palette;
  }

  return request;
}

// ============================================================================
// RESPONSE TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transforms Ideogram V3 response to standard format
 * @param {Object} response - Ideogram V3 API response
 * @returns {Array} Array of image URLs
 */
export function transformIdeogramV3Response(response) {
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
 * Validates Ideogram V3 response
 * @param {Object} response - Ideogram V3 API response
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateIdeogramV3Response(response) {
  const errors = [];

  if (!response) {
    errors.push("No response received from Ideogram V3");
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
 * Gets default parameters for Ideogram V3
 * @returns {Object} Default parameters
 */
export function getIdeogramV3Defaults() {
  return {
    prompt: "",
    negative_prompt: "",
    rendering_speed: ideogramV3Settings.rendering_speed.default,
    style: ideogramV3Settings.style.default,
    image_size: ideogramV3Settings.image_size.presets.default,
    num_images: ideogramV3Settings.num_images.default,
    expand_prompt: ideogramV3Settings.expand_prompt.default,
  };
}

/**
 * Checks if a model is Ideogram V3
 * @param {string} model - Model name
 * @returns {boolean} True if Ideogram V3
 */
export function isIdeogramV3Model(model) {
  return model === "ideogram-v3" || model === "ideogram/v3";
}

/**
 * Estimates cost for client-side display
 * @param {Object} params - Parameters
 * @returns {number} Estimated cost in credits
 */
export function estimateIdeogramV3Cost(params) {
  const normalized = normalizeIdeogramV3Params(params);
  return calculateIdeogramV3Cost(
    normalized.rendering_speed,
    normalized.num_images
  );
}

/**
 * Gets rendering speed options for UI
 * @returns {Array} Array of { value, label } objects
 */
export function getRenderingSpeedOptions() {
  return ideogramV3Settings.rendering_speed.options.map((value) => ({
    value,
    label:
      value === "TURBO"
        ? "Turbo (Fastest)"
        : value === "BALANCED"
          ? "Balanced (Recommended)"
          : "Quality (Best results)",
  }));
}

/**
 * Gets style options for UI
 * @returns {Array} Array of { value, label } objects
 */
export function getStyleOptions() {
  return ideogramV3Settings.style.options.map((value) => ({
    value,
    label:
      value === "AUTO"
        ? "Auto"
        : value === "GENERAL"
          ? "General"
          : value === "REALISTIC"
            ? "Realistic"
            : "Design",
  }));
}

/**
 * Gets image size options for UI
 * @returns {Array} Array of { value, label } objects
 */
export function getImageSizeOptions() {
  return ideogramV3Settings.image_size.presets.options
    .filter((value) => value !== "custom") // Remove custom for now
    .map((value) => ({
      value,
      label:
        value === "square_hd"
          ? "Square (1:1)"
          : value === "square"
            ? "Square (512x512)"
            : value === "portrait_4_3"
              ? "Portrait (3:4)"
              : value === "portrait_16_9"
                ? "Portrait (9:16)"
                : value === "landscape_4_3"
                  ? "Landscape (4:3)"
                  : "Landscape (16:9)",
    }));
}

// ============================================================================
// COMPOSITION HELPERS
// ============================================================================

/**
 * Prepares parameters for API request
 * @param {Object} rawParams - Raw parameters from client
 * @returns {Object} { valid: boolean, params: Object, errors: string[], cost: number }
 */
export function prepareIdeogramV3Request(rawParams) {
  // Handle description field (some tools use description instead of prompt)
  const params = { ...rawParams };
  if (params.description && !params.prompt) {
    params.prompt = params.description;
  }

  // Filter and normalize
  const filtered = filterIdeogramV3Params(params);
  const normalized = normalizeIdeogramV3Params(filtered);

  // Validate
  const validation = validateIdeogramV3Params(normalized);

  // Calculate cost
  const cost = calculateIdeogramV3Cost(
    normalized.rendering_speed,
    normalized.num_images
  );

  return {
    valid: validation.valid,
    params: normalized,
    errors: validation.errors,
    cost,
  };
}

/**
 * Processes complete Ideogram V3 request (validation + cost + request building)
 * @param {Object} rawParams - Raw parameters
 * @returns {Object} Complete request preparation result
 */
export function processIdeogramV3Request(rawParams) {
  const preparation = prepareIdeogramV3Request(rawParams);

  if (!preparation.valid) {
    return {
      success: false,
      errors: preparation.errors,
    };
  }

  const request = buildIdeogramV3Request(preparation.params);

  return {
    success: true,
    request,
    params: preparation.params,
    cost: preparation.cost,
  };
}

// ============================================================================
// EXPORT NORMALIZED SETTINGS (for backward compatibility)
// ============================================================================

export const normalizedV3Settings = {
  rendering_speed: {
    default: ideogramV3Settings.rendering_speed.default,
    options: getRenderingSpeedOptions(),
  },
  style: {
    default: ideogramV3Settings.style.default,
    options: getStyleOptions(),
  },
  image_size: {
    presets: {
      default: ideogramV3Settings.image_size.presets.default,
    },
    options: getImageSizeOptions(),
  },
};
