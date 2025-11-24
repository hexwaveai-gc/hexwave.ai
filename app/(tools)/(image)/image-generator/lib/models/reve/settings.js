const reveSettings = {
  prompt: {
    description: "The text description of the desired image",
    required: true,
  },
  aspect_ratio: {
    description: "The desired aspect ratio of the generated image.",
    type: "select",
    options: [
      { value: "16:9", label: "Landscape (16:9)" },
      { value: "9:16", label: "Portrait (9:16)" },
      { value: "3:2", label: "Landscape (3:2)" },
      { value: "2:3", label: "Portrait (2:3)" },
      { value: "4:3", label: "Landscape (4:3)" },
      { value: "3:4", label: "Portrait (3:4)" },
      { value: "1:1", label: "Square (1:1)" },
    ],
    default: "3:2",
  },
  num_images: {
    default: 1,
    min: 1,
    max: 4,
    description: "Number of images to generate",
    type: "integer",
  },
  output_format: {
    default: "png",
    options: ["png", "jpeg", "webp"],
    description: "Output format for the generated image",
    type: "select",
  },
  sync_mode: {
    default: false,
    description:
      "If set to true, media will be returned as a data URI and won't be available in request history",
    type: "boolean",
    hidden: true, // Internal parameter, not needed in UI
  },
  image_urls: {
    description:
      "Reference images for remix mode (1-4 images, max 1.5MB each).",
    min_files: 1,
    max_files: 4,
    max_file_size: 1.5 * 1024 * 1024, // 1.5 MB in bytes
    type: "array",
    default: [],
    supportedFormats: ["PNG", "JPEG", "WebP", "AVIF", "HEIF"],
  },
};

export default reveSettings;
