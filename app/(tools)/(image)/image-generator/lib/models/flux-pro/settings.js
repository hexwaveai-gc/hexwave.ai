const fluxProSettings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
  },
  aspect_ratio: {
    options: [
      "square_hd",

      "portrait_4_3",
      "portrait_16_9",
      "landscape_4_3",
      "landscape_16_9",
      "custom",
    ],
    default: "landscape_4_3",
    description: "Aspect ratio of the generated image",
  },
  width: {
    default: 1024,
    min: 256,
    max: 1440,
    description:
      "Width of the generated image in text-to-image mode. Only used when aspect_ratio=custom. Must be a multiple of 32.",
  },
  height: {
    default: 1024,
    min: 256,
    max: 1440,
    description:
      "Height of the generated image in text-to-image mode. Only used when aspect_ratio=custom. Must be a multiple of 32.",
  },
  steps: {
    default: 25,
    min: 1,
    max: 50,
    description: "Number of diffusion steps",
  },
  guidance: {
    default: 3,
    min: 2,
    max: 20,
    description:
      "Controls the balance between adherence to the text prompt and image quality/diversity. Higher values make the output more closely match the prompt but may reduce overall image quality.",
  },
  safety_tolerance: {
    default: 6,
    min: 1,
    max: 6,
    description: "Safety tolerance, 1 is most strict and 6 is most permissive",
  },
  seed: {
    description: "Random seed. Set for reproducible generation",
  },
  output_format: {
    options: ["jpeg", "png"],
    default: "jpeg",
    description: "Format of the output images",
  },
};

export default fluxProSettings;
