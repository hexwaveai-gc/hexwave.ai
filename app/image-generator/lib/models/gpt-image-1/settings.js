export const gptImage1Settings = {
  prompt: {
    description:
      "A text description of the desired image(s). Maximum length is 4000 characters.",
    required: true,
    maxLength: 4000,
  },
  size: {
    options: ["auto", "1024x1024", "1536x1024", "1024x1536"],
    default: "auto",
    description: "The size of the generated images.",
  },
  quality: {
    options: ["high", "medium", "low"],
    default: "high",
    description: "Rendering quality (e.g. low, medium, high).",
  },
  background: {
    options: ["auto", "transparent", "opaque"],
    default: "auto",
    description: "Background type for the generated images.",
  },
  input_fidelity: {
    options: ["low", "high"],
    default: "high",
    description:
      "Input fidelity for preserving details from input images. High fidelity better preserves elements like faces and logos. Note: High fidelity is only available for gpt-image-1 (full model). For gpt-image-1-mini, only 'low' is supported.",
  },
  model: {
    value: "gpt-image-1",
    description: "The OpenAI GPT-Image-1 model for image generation.",
  },
  quantity: {
    options: [1, 2, 3, 4],
    default: 1,
    description: "The number of images to generate.",
  },
};
