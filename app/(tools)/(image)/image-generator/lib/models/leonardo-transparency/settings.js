export const leonardoTransparencySettings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
  },
  modelId: {
    options: [
      "aa77f04e-3eec-4034-9c07-d0f619684628", //Leonardo Kino XL
    ],
    default: "aa77f04e-3eec-4034-9c07-d0f619684628",
    description: "The Leonardo transparency model version to use",
    labels: {
      "aa77f04e-3eec-4034-9c07-d0f619684628": "Leonardo Kino XL",
    },
  },
  width: {
    options: [
      512, 640, 768, 832, 864, 896, 960, 1024, 1088, 1152, 1216, 1280, 1344,
      1408, 1472, 1536,
    ],
    default: 1024,
    description: "Width of the generated image",
  },
  height: {
    options: [
      512, 640, 768, 832, 864, 896, 960, 1024, 1088, 1152, 1216, 1280, 1344,
      1408, 1472, 1536,
    ],
    default: 1024,
    description: "Height of the generated image",
  },
  num_images: {
    options: [1, 2, 3, 4],
    default: 1,
    description: "Number of images to generate",
  },
};
