const wanV22A14BSettings = {
  prompt: {
    description: "The text prompt to guide image generation",
    required: true,
  },
  negative_prompt: {
    description: "Negative prompt for video generation",
    default: "",
    type: "textarea",
  },
  seed: {
    description:
      "Random seed for reproducibility. If None, a random seed is chosen",
    type: "integer",
  },
  num_inference_steps: {
    default: 27,
    min: 2,
    max: 40,
    description:
      "Number of inference steps for sampling. Higher values give better quality but take longer",
    type: "integer",
  },
  enable_safety_checker: {
    default: false,
    description:
      "If set to true, input data will be checked for safety before processing",
    type: "boolean",
    hidden: true, // Hide safety parameter from UI as per SOP
  },
  enable_prompt_expansion: {
    default: false,
    description:
      "Whether to enable prompt expansion. This will use a large language model to expand the prompt with additional details while maintaining the original meaning",
    type: "boolean",
  },
  acceleration: {
    options: ["none", "regular"],
    default: "regular",
    description:
      "Acceleration level to use. The more acceleration, the faster the generation, but with lower quality. The recommended value is 'regular'",
  },
  guidance_scale: {
    default: 3.5,
    min: 1,
    max: 10,
    step: 0.1,
    description:
      "Classifier-free guidance scale. Higher values give better adherence to the prompt but may decrease quality",
    type: "number",
  },
  guidance_scale_2: {
    default: 4,
    min: 1,
    max: 10,
    step: 0.1,
    description:
      "Guidance scale for the second stage of the model. This is used to control the adherence to the prompt in the second stage of the model",
    type: "number",
  },
  shift: {
    default: 2,
    min: 1,
    max: 10,
    step: 0.1,
    description: "Shift value for the image. Must be between 1.0 and 10.0",
    type: "number",
  },
  loras: {
    description: "LoRA weights to be used in the inference",
    default: [],
    type: "array",
    max_files: 10, // Reasonable limit for LoRA files
  },
  image_size: {
    description: "The size of the generated image",
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
      width: { default: 1024, min: 256, max: 2048, step: 8 },
      height: { default: 1024, min: 256, max: 2048, step: 8 },
      description:
        "Width and height must be between 256 and 2048, in multiples of 8.",
    },
  },
  image_format: {
    options: ["png", "jpeg"],
    default: "jpeg",
    description: "The format of the output image",
  },
};

export default wanV22A14BSettings;
