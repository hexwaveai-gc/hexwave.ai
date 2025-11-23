const seedreamV3Settings = {
  prompt: {
    description: "The text prompt used to generate the image",
    required: true,
  },
  image_size: {
    description: "The resolution of the generated image",
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
      default: "square_hd",
      description: "Select a preset aspect ratio/resolution.",
    },
    custom: {
      // Frontend needs width/height inputs if 'custom' is selected
      width: { default: 1024, min: 512, max: 2048, step: 8 },
      height: { default: 1024, min: 512, max: 2048, step: 8 },
      description: "Width and height must be between 512 and 2048.",
    },
  },
  guidance_scale: {
    default: 2.5,
    min: 0.5,
    max: 10,
    step: 0.1,
    description:
      "Controls how closely the output image aligns with the input prompt. Higher values mean stronger prompt correlation.",
    type: "number",
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

export default seedreamV3Settings;
