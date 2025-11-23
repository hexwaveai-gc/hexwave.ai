import { ModelSettings } from "../runwaygen4/settings";

const fluxSettings: ModelSettings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
    type: "text",
  },
  aspect_ratio: {
    options: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    default: "1:1",
    description: "Aspect ratio of the generated image",
    type: "select",
  },
  num_images: {
    description: "Number of images to generate",
    type: "number",
    min: 1,
    max: 4,
    default: 1,
  },
  guidance_scale: {
    description: "How strictly to follow the prompt (higher = more strict)",
    type: "number",
    min: 1,
    max: 20,
    default: 7.5,
  },
  seed: {
    description: "Random seed for reproducible generation",
    type: "number",
    min: 0,
    max: 999999999,
  },
};

export default fluxSettings;

