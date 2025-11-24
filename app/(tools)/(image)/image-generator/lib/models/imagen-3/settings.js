const imagen3Settings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
  },
  negative_prompt: {
    description: "Text prompt for what to discourage in the generated images",
    required: false,
  },
  aspect_ratio: {
    options: ["1:1", "9:16", "16:9", "3:4", "4:3"],
    default: "1:1",
    description: "Aspect ratio of the generated image",
  },
};

export default imagen3Settings;
