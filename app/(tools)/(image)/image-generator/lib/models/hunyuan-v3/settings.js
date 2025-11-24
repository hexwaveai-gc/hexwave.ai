const hunyuanV3Settings = {
  prompt: {
    description: "The text prompt for image generation",
    required: true,
  },
  negative_prompt: {
    default: "",
    description:
      "The negative prompt to guide the image generation away from certain concepts",
    type: "text",
  },
  image_size: {
    description: "The desired size of the generated image",
    type: "image_size",
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
      description: "Select the image size and aspect ratio",
    },
    custom: {
      width: { default: 1024, min: 512, max: 2048, step: 8 },
      height: { default: 1024, min: 512, max: 2048, step: 8 },
      description:
        "Custom width and height in pixels. Must be between 512 and 2048.",
    },
  },
  num_images: {
    default: 1,
    min: 1,
    max: 4,
    description: "The number of images to generate",
    type: "integer",
  },
  num_inference_steps: {
    default: 28,
    min: 1,
    max: 50,
    description: "Number of denoising steps",
    type: "integer",
  },
  guidance_scale: {
    default: 7.5,
    min: 1,
    max: 20,
    step: 0.5,
    description:
      "Controls how much the model adheres to the prompt. Higher values mean stricter adherence",
    type: "number",
  },
  seed: {
    description:
      "Random seed for reproducible results. If None, a random seed is used",
    type: "integer",
  },
  enable_safety_checker: {
    default: false,
    description: "If set to true, the safety checker will be enabled",
    type: "boolean",
    hidden: true, // Don't show in UI, let API handle safety
  },
  output_format: {
    options: ["jpeg", "png"],
    default: "png",
    description: "The format of the generated image",
  },
  enable_prompt_expansion: {
    default: false,
    description:
      "Whether to enable prompt expansion. This will use a large language model to expand the prompt with additional details while maintaining the original meaning",
    type: "boolean",
  },
};

export default hunyuanV3Settings;
