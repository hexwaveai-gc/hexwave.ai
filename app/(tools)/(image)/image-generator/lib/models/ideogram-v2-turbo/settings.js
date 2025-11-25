const ideogramV2TurboSettings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
  },
  negative_prompt: {
    description: "Things you do not want to see in the generated image",
    default: "",
  },
  aspect_ratio: {
    options: [
      "10:16",
      "16:10",
      "9:16",
      "16:9",
      "4:3",
      "3:4",
      "1:1",
      "1:3",
      "3:1",
      "3:2",
      "2:3",
    ],
    default: "1:1",
    description:
      "Aspect ratio. Ignored if a resolution or inpainting image is given in advanced settings.",
  },
  style_type: {
    options: ["Auto", "General", "Realistic", "Design", "Render_3D", "Anime"],
    default: "Auto",
    description:
      "The styles help define the specific aesthetic of the image you want to generate.",
  },
  seed: {
    description: "Random seed. Set for reproducible generation",
  },
};

export default ideogramV2TurboSettings;
