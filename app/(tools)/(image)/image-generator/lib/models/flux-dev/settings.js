const fluxDevSettings = {
  prompt: {
    description: "Prompt for generated image",
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
    description: "Aspect ratio of the generated image",
  },
  image: {
    description: "Input image for image to image mode.",
  },
  prompt_strength: {
    default: 0.8,
    min: 0,
    max: 1,
    description:
      "Prompt strength (or denoising strength) when using image to image. 1.0 corresponds to full destruction of information in image.",
  },
  num_inference_steps: {
    default: 28,
    min: 1,
    max: 50,
    description: "Number of inference steps",
  },
  guidance_scale: {
    default: 3.5,
    min: 0,
    max: 10,
    description: "Guidance scale for the diffusion process",
  },
  seed: {
    description: "Random seed. Set for reproducible generation",
  },
  output_format: {
    options: ["webp", "jpg", "png"],
    default: "jpg",
    description: "Format of the output images",
  },
  output_quality: {
    default: 80,
    min: 0,
    max: 100,
    description:
      "Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs",
  },
  // hf_lora: {
  //   default:
  //     "https://civitai.com/api/download/models/00000?type=Model&format=SafeTensor&token=9ff111af4d2e8460f1045c00820b667d",
  //   description: "HF, Replicate, CivitAI, or URL to a LoRA",
  // },
  lora_scale: {
    default: 0.8,
    min: 0,
    max: 1,
    description: "Scale for the LoRA weights",
  },
  disable_safety_checker: {
    default: true,
    description: "Disable safety checker for generated images",
  },
};

export default fluxDevSettings;
