const fluxProKontextSettings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
  },
  aspect_ratio: {
    options: [
      "21:9",
      "16:9",
      "4:3",
      "3:2",
      "1:1",
      "2:3",
      "3:4",
      "9:16",
      "9:21",
    ],
    default: "1:1",
    description: "The aspect ratio of the generated image",
  },
  guidance_scale: {
    default: 3.5,
    min: 1,
    max: 20,
    description:
      "The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.",
  },
  safety_tolerance: {
    options: ["1", "2", "3", "4", "5", "6"],
    default: "6",
    description:
      "The safety tolerance level for the generated image. 1 being the most strict and 6 being the most permissive.",
  },
  seed: {
    description:
      "The same seed and the same prompt given to the same version of the model will output the same image every time.",
  },
  output_format: {
    options: ["jpeg", "png"],
    default: "jpeg",
    description: "The format of the generated image",
  },
};

export default fluxProKontextSettings;
