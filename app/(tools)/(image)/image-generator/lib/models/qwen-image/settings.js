const qwenImageSettings = {
  prompt: {
    description: "The prompt to generate the image with",
    required: true,
  },
  image_size: {
    description: "The size of the generated image",
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
      default: "landscape_4_3",
      description: "Select the image size and aspect ratio",
    },
    custom: {
      width: { default: 1024, min: 256, max: 2048, step: 8 },
      height: { default: 1024, min: 256, max: 2048, step: 8 },
      description:
        "Custom width and height in pixels. Must be between 256 and 2048.",
    },
  },
  num_inference_steps: {
    default: 30,
    min: 2,
    max: 50,
    description: "The number of inference steps to perform",
    type: "integer",
  },
  guidance_scale: {
    default: 2.5,
    min: 0,
    max: 20,
    step: 0.5,
    description:
      "The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you",
    type: "number",
  },
  negative_prompt: {
    default: " ",
    description: "The negative prompt for the generation",
    type: "text",
  },
  acceleration: {
    options: ["none", "regular", "high"],
    default: "none",
    description:
      "Acceleration level for image generation. Higher acceleration increases speed. 'regular' balances speed and quality. 'high' is recommended for images without text",
  },
  output_format: {
    options: ["jpeg", "png"],
    default: "png",
    description: "The format of the generated image",
  },
  enable_safety_checker: {
    default: false,
    description: "If set to true, the safety checker will be enabled",
    type: "boolean",
  },
  seed: {
    description:
      "The same seed and the same prompt given to the same version of the model will output the same image every time",
    type: "integer",
  },
};

export default qwenImageSettings;
