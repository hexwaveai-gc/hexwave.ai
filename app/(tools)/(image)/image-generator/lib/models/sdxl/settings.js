const sdxlSettings = {
  prompt: {
    description: "Text prompt describing the desired image",
    required: true,
  },
  seed: {
    description: "Random seed. Leave blank to randomize the seed",
  },
  image_size: {
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
  guidance_scale: {
    default: 7.5,
    min: 1,
    max: 50,
    description: "Scale for classifier-free guidance",
  },
  num_inference_steps: {
    default: 50,
    min: 1,
    max: 500,
    description: "Number of denoising steps",
  },
  negative_prompt: {
    default: "",
    description: "Use it to address details that you don't want in the image.",
  },
};

export default sdxlSettings;
