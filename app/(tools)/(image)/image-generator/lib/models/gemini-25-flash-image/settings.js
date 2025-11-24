const gemini25FlashImageSettings = {
  prompt: {
    description: "The prompt for image generation",
    required: true,
  },
  num_images: {
    default: 1,
    min: 1,
    max: 4,
    description: "Number of images to generate",
    type: "integer",
  },
  output_format: {
    options: ["jpeg", "png"],
    default: "jpeg",
    description: "Output format for the images",
  },
  sync_mode: {
    default: false,
    description:
      "When true, images will be returned as data URIs instead of URLs",
    type: "boolean",
  },
  aspect_ratio: {
    options: [
      { value: "1:1", label: "Square (1:1)" },
      { value: "21:9", label: "Ultra Wide (21:9)" },
      { value: "16:9", label: "Wide (16:9)" },
      { value: "4:3", label: "Landscape (4:3)" },
      { value: "3:2", label: "Landscape (3:2)" },
      { value: "5:4", label: "Landscape (5:4)" },
      { value: "2:3", label: "Portrait (2:3)" },
      { value: "3:4", label: "Portrait (3:4)" },
      { value: "4:5", label: "Portrait (4:5)" },
      { value: "9:16", label: "Portrait (9:16)" },
    ],
    default: "1:1",
    description: "Aspect ratio for the generated images",
  },
};

export default gemini25FlashImageSettings;
