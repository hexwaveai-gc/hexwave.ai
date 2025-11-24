const stableDiffusion3Settings = {
  prompt: {
    description: "Text prompt describing the desired image",
    required: true,
  },
  aspect_ratio: {
    options: [
      "square_hd",

      "portrait_4_3",
      "portrait_16_9",
      "landscape_4_3",
      "landscape_16_9",
    ],
    default: "square_hd",
    description:
      "The aspect ratio of your output image. This value is ignored if you are using an input image.",
  },
  cfg: {
    default: 3.5,
    min: 0,
    max: 20,
    description:
      "The guidance scale tells the model how similar the output should be to the prompt.",
  },
  steps: {
    default: 28,
    min: 1,
    max: 28,
    description: "Number of steps to run the sampler for.",
  },
  seed: {
    description: "Set a seed for reproducibility. Random by default.",
  },
  negative_prompt: {
    default: "",
    description:
      "Negative prompts do not really work in SD3. Using a negative prompt will change your output in unpredictable ways.",
  },
};

export default stableDiffusion3Settings;
