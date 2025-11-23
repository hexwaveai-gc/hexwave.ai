const ideogramV3Settings = {
  prompt: {
    description: "Text prompt for image generation.",
    required: true,
  },
  negative_prompt: {
    default: "",
    description:
      "Description of what to exclude from an image. Descriptions in the prompt take precedence to descriptions in the negative prompt.",
  },
  image_urls: {
    // Note: Frontend component will handle the actual upload/URL management
    description:
      "A set of images to use as style references (max total 10MB). Cannot be used with 'style' or 'style_codes'.",
    type: "file_upload", // Custom type hint for frontend
    max_files: 5, // Arbitrary limit, adjust as needed
    max_total_size_mb: 10,
  },
  rendering_speed: {
    options: ["TURBO", "BALANCED", "QUALITY"],
    default: "QUALITY",
    description: "The rendering speed to use.",
  },
  color_palette: {
    description: "A color palette for generation.",
    type: "palette", // Custom type hint for frontend
    presets: {
      options: [
        "None", // Add None option
        "EMBER",
        "FRESH",
        "JUNGLE",
        "MAGIC",
        "MELON",
        "MOSAIC",
        "PASTEL",
        "ULTRAMARINE",
      ],
      default: "None",
      description: "Select a preset color palette.",
    },
    custom: {
      description:
        "Define a custom palette with hex colors and optional weights (0-1).",
      // Frontend will need UI for adding/removing ColorPaletteMember { rgb: {r,g,b}, color_weight: 0.5 }
      // For simplicity, maybe start with presets only? Or just hex input?
      // Let's keep it simple for now: just allow preset selection.
      // The API expects 'name' or 'members'. We'll handle this transformation in the API route.
    },
  },
  style_codes: {
    // Note: Frontend component will handle inputting/managing these codes
    description:
      "A list of 8-character hex codes for style. Cannot be used with Style Codes or Reference Images.",
    type: "string_list", // Custom type hint for frontend
    max_items: 5, // Arbitrary limit
  },
  style: {
    options: ["AUTO", "GENERAL", "REALISTIC", "DESIGN"],
    default: "AUTO",
    description:
      "The style type to generate with. Cannot be used with Style Codes or Reference Images.",
  },
  expand_prompt: {
    default: true,
    description: "Use MagicPrompt to enhance the input prompt.",
    type: "boolean",
  },
  num_images: {
    default: 1,
    min: 1,
    max: 4, // Fal might support more, but align with current UI for now
    description: "Number of images to generate.",
    type: "integer",
  },
  seed: {
    description: "Seed for the random number generator (optional).",
    type: "integer",
  },
  image_size: {
    description: "The resolution of the generated image.",
    type: "image_size", // Custom type hint for frontend
    presets: {
      options: [
        "square_hd", // 1024x1024
        "portrait_4_3",
        "portrait_16_9",
        "landscape_4_3",
        "landscape_16_9",
        "custom", // Add custom option
      ],
      default: "square_hd",
      description: "Select a preset aspect ratio/resolution.",
    },
    custom: {
      // Frontend needs width/height inputs if 'custom' is selected
      width: { default: 1024, min: 64, max: 2048, step: 8 }, // Example constraints, adjust based on Fal limits if known
      height: { default: 1024, min: 64, max: 2048, step: 8 },
      description: "Specify custom dimensions (width x height).",
    },
    // The API expects either a string preset or { width, height }. Handled in API route.
  },
};

export default ideogramV3Settings;
