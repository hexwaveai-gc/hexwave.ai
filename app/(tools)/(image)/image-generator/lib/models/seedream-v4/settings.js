const seedreamV4Settings = {
  prompt: {
    description: "The text prompt used to generate the image",
    required: true,
  },
  image_size: {
    description:
      "The size of the generated image. Width and height must be between 1024 and 4096.",
    type: "image_size", // Custom type hint for frontend
    presets: {
      options: [
        "square_hd", // 1280x1280 (default)
        "portrait_4_3", // 1024x1365
        "portrait_16_9", // 1024x1820
        "landscape_4_3", // 1365x1024
        "landscape_16_9", // 1820x1024
        "custom", // Custom dimensions
      ],
      default: "square_hd",
      description: "Select a preset aspect ratio/resolution.",
    },
    custom: {
      // Frontend needs width/height inputs if 'custom' is selected
      width: { default: 1280, min: 1024, max: 4096, step: 8 },
      height: { default: 1280, min: 1024, max: 4096, step: 8 },
      description: "Width and height must be between 1024 and 4096.",
    },
    // Default value for the API
    default: { width: 1280, height: 1280 },
  },
  num_images: {
    default: 1,
    min: 1,
    max: 6,
    description: "Number of times to run generation with the prompt",
    type: "integer",
  },
  seed: {
    description:
      "Random seed to control the stochasticity of image generation (optional)",
    type: "integer",
  },
  image_urls: {
    description:
      "Reference images for editing (optional). Upload up to 10 images to use as references.",
    max_files: 10,
    type: "array",
    default: [],
  },
  enable_safety_checker: {
    default: false,
    description: "If set to true, the safety checker will be enabled",
    type: "boolean",
    hidden: true, // Hide from UI as per SOP guidelines for safety parameters
  },
  sync_mode: {
    default: false,
    description:
      "If set to true, the function will wait for the image to be generated and uploaded before returning the response",
    type: "boolean",
    hidden: true, // Internal parameter, not needed in UI
  },
};

export default seedreamV4Settings;
