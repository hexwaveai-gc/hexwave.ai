export const stableDiffusion35LargeTurboSettings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
  },
  aspect_ratio: {
    options: [
      "1:1",
      "16:9",
      "21:9",
      "3:2",
      "2:3",
      "4:5",
      "5:4",
      "3:4",
      "4:3",
      "9:16",
      "9:21",
    ],
    default: "1:1",
    description:
      "The aspect ratio of your output image. This value is ignored if you are using an input image.",
  },
  cfg: {
    default: 1,
    min: 0,
    max: 20,
    description:
      "The guidance scale tells the model how similar the output should be to the prompt.",
  },
  image: {
    description:
      "Input image for image to image mode. The aspect ratio of your output will match this image.",
  },
  prompt_strength: {
    default: 0.85,
    min: 0,
    max: 1,
    description:
      "Prompt strength (or denoising strength) when using image to image. 1.0 corresponds to full destruction of information in image.",
  },
  steps: {
    default: 4,
    min: 1,
    max: 10,
    description: "Number of steps to run the sampler for.",
  },
  output_format: {
    options: ["webp", "jpg", "png"],
    default: "jpg",
    description: "Format of the output images",
  },
  output_quality: {
    default: 90,
    min: 0,
    max: 100,
    description:
      "Quality of the output images, from 0 to 100. 100 is best quality, 0 is lowest quality.",
  },
  seed: {
    description: "Set a seed for reproducibility. Random by default.",
  },
};
