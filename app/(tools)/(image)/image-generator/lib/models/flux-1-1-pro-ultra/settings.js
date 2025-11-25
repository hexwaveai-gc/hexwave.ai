const flux11ProUltraSettings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
  },
  aspect_ratio: {
    options: [
      "1:1", // square
      "3:4", // portrait 4:3
      "9:16", // portrait 16:9
      "4:3", // landscape 4:3
      "16:9", // landscape 16:9
      "21:9", // ultrawide
      "9:21", // ultra portrait
    ],
    default: "4:3",
    description: "Aspect ratio of the generated image",
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
  raw: {
    default: false,
    description: "Generate less processed, more natural-looking images",
  },
  output_format: {
    options: ["jpeg", "png"],
    default: "jpeg",
    description: "Format of the output images",
  },
};

export default flux11ProUltraSettings;
