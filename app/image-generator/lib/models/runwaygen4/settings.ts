export interface ModelSettings {
  [key: string]: {
    description?: string;
    required?: boolean;
    options?: string[] | number[];
    default?: any;
    type?: string;
    max_files?: number;
    min?: number;
    max?: number;
  };
}

const runwaygen4Settings: ModelSettings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
    type: "text",
  },
  aspect_ratio: {
    options: ["16:9", "9:16", "4:3", "3:4", "1:1", "21:9"],
    default: "16:9",
    description: "Aspect ratio of the generated image",
    type: "select",
  },
  resolution: {
    options: ["720p", "1080p"],
    default: "1080p",
    description: "Image resolution",
    type: "select",
  },
  reference_images: {
    description:
      "Up to 3 reference images (optional). Images must be between 0.5 and 2 aspect ratio.",
    max_files: 3,
    type: "image_array",
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
    type: "number",
    min: 0,
    max: 999999999,
  },
};

export default runwaygen4Settings;

