const wan25Settings = {
  prompt: {
    description:
      "The prompt for image generation. Supports Chinese and English, max 2000 characters",
    required: true,
    maxLength: 2000,
  },
  negative_prompt: {
    description:
      "Negative prompt to describe content to avoid. Max 500 characters",
    maxLength: 500,
    default: "",
  },
  image_size: {
    description:
      "The size of the generated image. For text-to-image: total pixels between 768×768 and 1440×1440, aspect ratio [1:4, 4:1]. For image-to-image: width and height between 384 and 5000 pixels",
    type: "image_size",
    presets: {
      options: [
        "square_hd",
        "landscape_16_9",
        "portrait_16_9",
        "portrait_4_3",
        "landscape_4_3",
        "custom", // Custom dimensions
      ],
      default: "square_hd",
      description: "Select a preset aspect ratio/resolution.",
    },
    custom: {
      // Note: Min/max here are the widest range (image-to-image). Validation function checks mode-specific limits.
      width: { default: 1280, min: 384, max: 5000, step: 8 },
      height: { default: 1280, min: 384, max: 5000, step: 8 },
      description:
        "For text-to-image: total pixels between 768×768 and 1440×1440, aspect ratio 1:4 to 4:1. For image-to-image: 384-5000 pixels per dimension.",
    },
    // Default value for the API
    default: "square_hd",
  },
  num_images: {
    default: 1,
    min: 1,
    max: 4,
    description: "Number of images to generate",
    type: "integer",
  },
  enable_prompt_expansion: {
    default: true,
    description:
      "Whether to enable prompt rewriting using LLM. Improves results for short prompts but increases processing time",
    type: "boolean",
  },
  seed: {
    description:
      "Random seed for reproducibility. If None, a random seed is chosen",
    type: "integer",
  },
  // For image-to-image mode
  image_urls: {
    description: "Upload up to 2 reference images",
    max_files: 2,
    type: "array",
    default: [],
  },
};

export default wan25Settings;
