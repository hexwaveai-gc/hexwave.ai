const nanoBananaProSettings = {
  prompt: {
    description: "The text prompt to generate or edit an image",
    required: true,
  },
  num_images: {
    default: 1,
    min: 1,
    max: 4,
    description: "Number of images to generate",
    type: "integer",
  },
  aspect_ratio: {
    options: [
      { value: "auto", label: "Auto" },
      { value: "21:9", label: "Ultra Wide (21:9)" },
      { value: "16:9", label: "Wide (16:9)" },
      { value: "3:2", label: "Landscape (3:2)" },
      { value: "4:3", label: "Landscape (4:3)" },
      { value: "5:4", label: "Landscape (5:4)" },
      { value: "1:1", label: "Square (1:1)" },
      { value: "4:5", label: "Portrait (4:5)" },
      { value: "3:4", label: "Portrait (3:4)" },
      { value: "2:3", label: "Portrait (2:3)" },
      { value: "9:16", label: "Portrait (9:16)" },
    ],
    default: "1:1",
    description:
      "Aspect ratio of the generated image. Use 'auto' for image editing to maintain original aspect ratio",
  },
  output_format: {
    options: ["jpeg", "png", "webp"],
    default: "png",
    description: "The format of the generated image",
  },
  sync_mode: {
    default: false,
    description:
      "If true, the media will be returned as a data URI and won't be available in request history",
    type: "boolean",
    hidden: true, // Hide from UI - use default
  },
  resolution: {
    options: ["1K", "2K", "4K"],
    default: "1K",
    description: "The resolution of the image to generate. ",
  },
};

export default nanoBananaProSettings;
