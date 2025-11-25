export const dallE3Settings = {
  prompt: {
    description:
      "A text description of the desired image(s). Maximum length is 4000 characters.",
    required: true,
    maxLength: 4000,
  },
  size: {
    options: ["1024x1024", "1792x1024", "1024x1792"],
    default: "1024x1024",
    description: "The size of the generated images.",
  },
  quality: {
    options: ["standard", "hd"],
    default: "standard",
    description:
      "HD creates images with finer details and greater consistency across the image.",
  },
  style: {
    options: ["vivid", "natural"],
    default: "vivid",
    description:
      "Vivid generates hyper-real and dramatic images, while natural produces more natural-looking images.",
  },
  response_format: {
    options: ["url", "b64_json"],
    default: "url",
    description:
      "The format in which the generated images are returned. URLs are valid for 60 minutes.",
  },
  model: {
    value: "dall-e-3",
    description: "The OpenAI DALL-E 3 model for image generation.",
  },
};
