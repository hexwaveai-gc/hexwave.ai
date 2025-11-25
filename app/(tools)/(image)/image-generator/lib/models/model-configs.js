// Model configurations for image generation models
// Each model has a configuration including fal model ID, cost per image, and other parameters

/**
 * Platform fee multiplier for all image generation
 * Applied to base costs to account for platform overhead
 */
import { logWarn } from "@/lib/betterStack";
const PLATFORM_FEE_MULTIPLIER = 0.769;

export const MODEL_CONFIGS = {
  "flux-1-1-pro": {
    falModelId: "fal-ai/flux-pro/v1.1",
    cost: 0.04, // cost per image in dollars (0.04 * 1000000 credits)
    description: "Updated pro version with improved detail and consistency",
    settingsModule: "flux-1-1-pro/settings",
    aspectRatioParam: "image_size", // This model expects aspect ratio as image_size
    customSizeHandling: true, // This model requires special handling for custom sizes
  },
  "flux-1-1-pro-ultra": {
    falModelId: "fal-ai/flux-pro/v1.1-ultra",
    cost: 0.06, // cost per image in dollars (0.06 * 1000000 credits)
    description:
      "Ultimate FLUX model with maximum quality and advanced features",
    settingsModule: "flux-1-1-pro-ultra/settings",
    aspectRatioParam: "aspect_ratio", // This model expects aspect ratio as aspect_ratio
    customSizeHandling: true, // This model requires special handling for custom sizes
  },
  "flux-pro": {
    falModelId: "fal-ai/flux-pro",
    cost: 0.04,
    description:
      "Professional model specializing in realistic and artistic compositions",
    settingsModule: "flux-pro/settings",
    aspectRatioParam: "aspect_ratio", // This model expects aspect ratio as aspect_ratio
    customSizeHandling: false, // This model doesn't need special handling for custom sizes
  },
  "flux-pro-kontext": {
    falModelId: "fal-ai/flux-pro/kontext/text-to-image",
    cost: 0.04, // cost per image in dollars (0.04 * 1000000 credits)
    description:
      "Enhanced FLUX model with improved context awareness for better image coherence",
    settingsModule: "flux-pro-kontext/settings",
    aspectRatioParam: "aspect_ratio",
    customSizeHandling: false,
  },
  "flux-pro-kontext-max": {
    falModelId: "fal-ai/flux-pro/kontext/max/text-to-image",
    cost: 0.08, // cost per image in dollars (0.08 * 1000000 credits)
    description:
      "Maximum quality FLUX model with enhanced context awareness and detail preservation",
    settingsModule: "flux-pro-kontext/settings", // Both use the same settings
    aspectRatioParam: "aspect_ratio",
    customSizeHandling: false,
  },
  "ideogram-v2": {
    falModelId: "fal-ai/ideogram/v2",
    cost: 0.08,
    description:
      "Professional model specializing in realistic and artistic compositions",
    settingsModule: "ideogram-v2/settings",
  },
  "ideogram-v2-turbo": {
    falModelId: "fal-ai/ideogram/v2/turbo",
    cost: 0.05,
    description:
      "Professional model specializing in realistic and artistic compositions",
    settingsModule: "ideogram-v2-turbo/settings",
  },
  "ideogram-v2a": {
    falModelId: "fal-ai/ideogram/v2a",
    cost: 0.04,
    description:
      "Professional model specializing in realistic and artistic compositions",
    settingsModule: "ideogram-v2a/settings",
  },
  "ideogram-v2a-turbo": {
    falModelId: "fal-ai/ideogram/v2a/turbo",
    cost: 0.025,
    description:
      "Professional model specializing in realistic and artistic compositions",
    settingsModule: "ideogram-v2a-turbo/settings",
  },
  "ideogram-v3": {
    falModelId: "fal-ai/ideogram/v3",
    cost: 0.09,
    description:
      "Professional model specializing in realistic and artistic compositions",
    settingsModule: "ideogram-v3/settings",
    aspectRatioParam: "image_size", // This model expects aspect ratio as image_size
    customSizeHandling: false, // This model doesn't need special handling for custom sizes
  },
  "recraft-v3": {
    falModelId: "fal-ai/recraft/v3/text-to-image",
    cost: 0.04,
    description:
      "Professional model specializing in realistic and artistic compositions",
    settingsModule: "recraft-v3/settings",
  },
  "stable-diffusion-3": {
    falModelId: "fal-ai/stable-diffusion-v3-medium",
    cost: 0.048,
    description:
      "Professional model specializing in realistic and artistic compositions",
    settingsModule: "stable-diffusion-3/settings",
    aspectRatioParam: "image_size",
  },
  "stable-diffusion-3-5-large": {
    falModelId: "fal-ai/stable-diffusion-v35-large",
    cost: 0.084,
    description:
      "Professional model specializing in realistic and artistic compositions",
    aspectRatioParam: "image_size",
    settingsModule: "stable-diffusion-3-5-large/settings",
  },
  sdxl: {
    falModelId: "fal-ai/fast-sdxl",
    cost: 0.012,
    description:
      "Professional model specializing in realistic and artistic compositions",
    aspectRatioParam: "image_size",
    settingsModule: "sdxl/settings",
  },
  "luma-photon": {
    falModelId: "fal-ai/luma-photon",
    cost: 0.024,
    description:
      "Professional model specializing in realistic and artistic compositions",
    settingsModule: "luma-photon/settings",
  },
  "luma-photon-flash": {
    falModelId: "fal-ai/luma-photon/flash",
    cost: 0.012,
    description:
      "Professional model specializing in realistic and artistic compositions",
    settingsModule: "luma-photon/settings",
  },
  "imagen-3": {
    falModelId: "fal-ai/imagen3",
    cost: 0.05,
    description:
      "Professional model specializing in realistic and artistic compositions",
    settingsModule: "imagen-3/settings",
  },
  "imagen-4": {
    falModelId: "fal-ai/imagen4/preview/ultra",
    cost: 0.06,
    description: "Google’s highest quality image generation model",
    settingsModule: "imagen-3/settings",
  },
  "seedream-v3": {
    falModelId: "fal-ai/bytedance/seedream/v3/text-to-image",
    cost: 0.03,
    description:
      "ByteDance's advanced text-to-image model with high-quality generation capabilities",
    settingsModule: "seedream-v3/settings",
    aspectRatioParam: "image_size", // This model expects image_size
    customSizeHandling: true, // This model supports custom sizes
  },
  "seedream-v4": {
    falModelId: "fal-ai/bytedance/seedream/v4/text-to-image",
    cost: 0.03,
    description:
      "ByteDance's new-generation image creation model integrating generation and editing capabilities",
    settingsModule: "seedream-v4/settings",
    aspectRatioParam: "image_size", // This model expects image_size
    customSizeHandling: true, // This model supports custom sizes
  },
  "dreamina-v31": {
    falModelId: "fal-ai/bytedance/dreamina/v3.1/text-to-image",
    cost: 0.03, // cost per image in dollars (0.03 * 1000000 credits)
    description:
      "ByteDance Dreamina showcases superior picture effects, with significant improvements in picture aesthetics, precise and diverse styles, and rich details",
    settingsModule: "dreamina-v31/settings",
    aspectRatioParam: "image_size", // This model expects image_size
    customSizeHandling: true, // This model supports custom sizes
  },
  "qwen-image": {
    falModelId: "fal-ai/qwen-image",
    cost: 0.02, // 0.016M credits per image
    description:
      "Qwen-Image is an image generation foundation model that achieves significant advances in complex text rendering and precise image editing",
    settingsModule: "qwen-image/settings",
    aspectRatioParam: "image_size", // This model expects image_size
    customSizeHandling: true, // This model supports custom sizes via width/height object
  },
  "gemini-25-flash-image": {
    falModelId: "fal-ai/gemini-25-flash-image",
    cost: 0.039, // 0.039M credits per image
    description: "Google's state-of-the-art image generation and editing model",
    settingsModule: "gemini-25-flash-image/settings",
    aspectRatioParam: null, // This model doesn't have aspect ratio parameter
    customSizeHandling: false, // This model doesn't support custom sizes
  },
  runwaygen4: {
    replicateModelId: "runwayml/gen4-image",
    cost: 0.08,
    description:
      "Runway's Gen-4 image generation model with reference image support",
    settingsModule: "runwaygen4/settings",
    validateParamsFunction: "validateRunwayGen4Params",
    aspectRatioParam: "aspect_ratio",
    customSizeHandling: false,
    useReplicate: true, // Flag to indicate this uses Replicate instead of Fal
  },
  "wan-v2-2-a14b": {
    falModelId: "fal-ai/wan/v2.2-a14b/text-to-image/lora",
    cost: 0.03, // 0.03M credits per image
    description:
      "Wan 2.2's 14B model with LoRA support generates high-fidelity images with enhanced prompt alignment, style adaptability",
    settingsModule: "wan-v2-2-a14b/settings",
    aspectRatioParam: "image_size", // This model expects image_size
    customSizeHandling: true, // This model supports custom sizes
  },
  "wan-25": {
    falModelId: "fal-ai/wan-25-preview/text-to-image",
    cost: 0.05, // 0.05M credits per image
    description:
      "Wan 2.5 advanced text-to-image model with superior quality and image editing capabilities",
    settingsModule: "wan-25/settings",
    aspectRatioParam: "image_size", // This model expects image_size
    customSizeHandling: true, // This model supports custom sizes
  },
  "hunyuan-v3": {
    falModelId: "fal-ai/hunyuan-image/v3/text-to-image",
    cost: 0.1, // 0.1M credits per image
    description:
      "Tencent's Hunyuan Image 3.0 with state-of-the-art visual content generation capabilities",
    settingsModule: "hunyuan-v3/settings",
    aspectRatioParam: "image_size", // This model expects image_size
    customSizeHandling: true, // This model supports custom sizes
  },
  "nano-banana-pro": {
    falModelId: "fal-ai/nano-banana-pro",
    cost: 0.15, // $0.15 per image (4K is 2x = $0.30)
    description:
      "Google's latest state-of-the-art image generation and editing model with exceptional realism and typography",
    settingsModule: "nano-banana-pro/settings",
    aspectRatioParam: "aspect_ratio",
    customSizeHandling: false,
  },
};

/**
 * Get model configuration by model ID
 * @param {string} modelId - The model identifier (e.g., "flux-1.1-pro")
 * @returns {Object|null} The model configuration or null if not found
 */
export function getModelConfig(modelId) {
  // Handle different formats of model IDs (with dashes or dots)
  const normalizedId = modelId.replace(/\./g, "-");
  return MODEL_CONFIGS[normalizedId] || null;
}

/**
 * Calculate the cost for generating images with a specific model
 * @param {string} modelId - The model identifier (e.g., "flux-1.1-pro")
 * @param {Object} params - Parameters object with num_images and other model-specific params
 * @returns {number} The cost in credits (1 dollar = 1,000,000 credits)
 */
export function calculateModelCost(modelId, params) {
  const config = getModelConfig(modelId);
  if (!config) return 0;

  let baseCost = config.cost * params.num_images * 1000000;

  // Special handling for ideogram-v3 with variable rendering speeds
  if (modelId === "ideogram-v3") {
    const renderingSpeed = params.rendering_speed?.toUpperCase() || "BALANCED";

    const costPerImage =
      {
        TURBO: 0.03,
        BALANCED: 0.06,
        QUALITY: 0.09,
      }[renderingSpeed] * 1000000;

    if (isNaN(costPerImage)) {
      logWarn(
        `Invalid rendering speed: ${params.rendering_speed}, defaulting to BALANCED`
      );
      baseCost = 0.06 * 1000000 * params.num_images;
    } else {
      baseCost = costPerImage * params.num_images;
    }
  }

  // Apply platform fee multiplier to all costs
  return Math.round(baseCost * PLATFORM_FEE_MULTIPLIER);
}
