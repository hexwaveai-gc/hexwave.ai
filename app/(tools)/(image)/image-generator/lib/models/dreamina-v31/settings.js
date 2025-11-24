const dreaminaV31Settings = {
  prompt: {
    description: "The text prompt used to generate the image",
    required: true,
  },
  image_size: {
    description:
      "The size of the generated image. Width and height must be between 512 and 2048.",
    type: "image_size", // Custom type hint for frontend
    presets: {
      options: [
        "square_hd", // 1024x1024
        "portrait_4_3", // 768x1024
        "portrait_16_9", // 576x1024
        "landscape_4_3", // 1024x768
        "landscape_16_9", // 1024x576
        "custom", // Custom dimensions
      ],
      default: "landscape_4_3",
      description: "Select a preset aspect ratio/resolution.",
    },
    custom: {
      // Frontend needs width/height inputs if 'custom' is selected
      width: { default: 2048, min: 512, max: 2048, step: 8 },
      height: { default: 1536, min: 512, max: 2048, step: 8 },
      description: "Width and height must be between 512 and 2048.",
    },
  },
  enhance_prompt: {
    default: false,
    description: "Whether to use an LLM to enhance the prompt",
    type: "boolean",
  },
  num_images: {
    default: 1,
    min: 1,
    max: 4,
    description: "Number of images to generate",
    type: "integer",
  },
  seed: {
    description:
      "Random seed to control the stochasticity of image generation (optional)",
    type: "integer",
  },
};

export default dreaminaV31Settings;
