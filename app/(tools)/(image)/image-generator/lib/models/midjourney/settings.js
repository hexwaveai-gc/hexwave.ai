export const midjourneySettings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
  },
  aspect_ratio: {
    options: [
      "1:1",
      "16:9",
      "9:16",
      "4:3",
      "3:4",
      "3:2",
      "2:3",
      "16:10",
      "10:16",
      "3:1",
      "1:3",
    ],
    default: "1:1",
    description: "Aspect ratio of the generated image",
  },
  _imageUrls: {
    description: "Array of image URLs to use as visual references",
    default: [],
  },
  _fullPrompt: {
    description: "Combined prompt with image URLs appended (internal use)",
  },
  webhook_url: {
    description: "Optional webhook URL for receiving generation updates",
    default: "",
  },
  webhook_secret: {
    description: "Optional webhook secret for authentication",
    default: "",
  },
  task_id: {
    description: "Task ID returned by the API for tracking generation progress",
  },
  status: {
    description: "Current status of the generation task",
    options: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  percentage: {
    description: "Generation progress percentage",
    default: "0",
  },
  image_urls: {
    description: "Array of generated image URLs",
    default: [],
  },
  original_image_url: {
    description: "URL of the original grid image",
  },
};
