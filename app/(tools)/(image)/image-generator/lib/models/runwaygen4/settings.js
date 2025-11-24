const runwaygen4Settings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
  },
  aspect_ratio: {
    options: ["16:9", "9:16", "4:3", "3:4", "1:1", "21:9"],
    default: "16:9",
    description: "Aspect ratio of the generated image",
  },
  resolution: {
    options: ["720p", "1080p"],
    default: "1080p",
    description: "Image resolution",
  },
  reference_images: {
    description:
      "Up to 3 reference images (optional). Images must be between 0.5 and 2 aspect ratio.",
    max_files: 3,
    type: "array",
    default: [],
  },
  reference_tags: {
    description:
      "An optional tag for each of your reference images. Tags must be alphanumeric and start with a letter. You can reference them in your prompt using @tag_name. Tags must be between 3 and 15 characters.",
    type: "array",
    default: [],
  },
  seed: {
    description: "Random seed. Set for reproducible generation",
    type: "integer",
  },
};

export default runwaygen4Settings;
