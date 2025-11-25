export const leonardoPhoenixSettings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
  },
  modelId: {
    options: [
      "de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3", // Leonardo Phoenix 1.0
      "6b645e3a-d64f-4341-a6d8-7a3690fbf042", // Leonardo Phoenix 0.9
    ],
    default: "de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3",
    description: "The Leonardo Phoenix model version to use",
    labels: {
      "de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3": "Leonardo Phoenix 1.0",
      "6b645e3a-d64f-4341-a6d8-7a3690fbf042": "Leonardo Phoenix 0.9",
    },
  },
  contrast: {
    options: [1.0, 1.3, 1.8, 2.5, 3, 3.5, 4, 4.5],
    default: 3.5,
    description:
      "Contrast level for the generated image. Higher values create more contrast.",
    labels: {
      "1.0": "Very Low",
      1.3: "Low",
      1.8: "Slightly Low",
      2.5: "Normal",
      3: "Low",
      3.5: "Medium",
      4: "High",
      4.5: "Very High",
    },
  },
  width: {
    options: [
      512, 640, 768, 832, 864, 896, 960, 1024, 1088, 1152, 1216, 1280, 1344,
      1408, 1472, 1536,
    ],
    default: 1024,
    description: "Width of the generated image",
  },
  height: {
    options: [
      512, 640, 768, 832, 864, 896, 960, 1024, 1088, 1152, 1216, 1280, 1344,
      1408, 1472, 1536,
    ],
    default: 1024,
    description: "Height of the generated image",
  },
  alchemy: {
    options: [true, false],
    default: true,
    description: "Generation mode: Quality (true) or Fast (false)",
    labels: {
      true: "Quality",
      false: "Fast",
    },
  },
  ultra: {
    options: [true, false],
    default: false,
    description:
      "Enable Ultra generation mode for higher quality (may take longer)",
  },
  enhancePrompt: {
    options: [true, false],
    default: false,
    description: "Enable prompt enhancement to improve generation results",
  },
  enhancePromptInstruction: {
    description:
      "Custom instruction for prompt enhancement when using 'Edit with AI' mode",
  },
  styleUUID: {
    options: [
      "556c1ee5-ec38-42e8-955a-1e82dad0ffa1", // None
      "111dc692-d470-4eec-b791-3475abac4c46", // Dynamic
      "a5632c7c-ddbb-4e2f-ba34-8456ab3ac436", // Cinematic
      "33abbb99-03b9-4dd7-9761-ee98650b2c88", // Cinematic Concept
      "6fedbf1f-4a17-45ec-84fb-92fe524a29ef", // Creative
      "594c4a08-a522-4e0e-b7ff-e4dac4b6b622", // Fashion
      "2e74ec31-f3a4-4825-b08b-2894f6d13941", // Graphic Design Pop Art
      "1fbb6a68-9319-44d2-8d56-2957ca0ece6a", // Graphic Design Vector
      "97c20e5c-1af6-4d42-b227-54d03d8f0727", // HDR
      "645e4195-f63d-4715-a3f2-3fb1e6eb8c70", // Illustration
      "30c1d34f-e3a9-479a-b56f-c018bbc9c02a", // Macro
      "cadc8cd6-7838-4c99-b645-df76be8ba8d8", // Minimalist
      "621e1c9a-6319-4bee-a12d-ae40659162fa", // Moody
      "8e2bc543-6ee2-45f9-bcd9-594b6ce84dcd", // Portrait
      "22a9a7d2-2166-4d86-80ff-22e2643adbcf", // Pro B&W photography
      "7c3f932b-a572-47cb-9b9b-f20211e63b5b", // Pro color photography
      "581ba6d6-5aac-4492-bebe-54c424a0d46e", // Pro film photography
      "0d34f8e1-46d4-428f-8ddd-4b11811fa7c9", // Portrait Fashion
      "b504f83c-3326-4947-82e1-7fe9e839ec0f", // Ray Traced
      "be8c6b58-739c-4d44-b9c1-b032ed308b61", // Sketch (B&W)
      "093accc3-7633-4ffd-82da-d34000dfc0d6", // Sketch (Color)
      "5bdc3f2a-1be6-4d1c-8e77-992a30824a2c", // Stock Photo
      "dee282d3-891f-4f73-ba02-7f8131e5541b", // Vibrant
      "debdf72a-91a4-467b-bf61-cc02bdeb69c6", // 3D Render
      "9fdc5e8c-4d13-49b4-9ce6-5a74cbb19177", // Bokeh
    ],
    default: "556c1ee5-ec38-42e8-955a-1e82dad0ffa1",
    description: "Preset style to apply to the generated image",
    labels: {
      "556c1ee5-ec38-42e8-955a-1e82dad0ffa1": "None",
      "111dc692-d470-4eec-b791-3475abac4c46": "Dynamic",
      "a5632c7c-ddbb-4e2f-ba34-8456ab3ac436": "Cinematic",
      "33abbb99-03b9-4dd7-9761-ee98650b2c88": "Cinematic Concept",
      "6fedbf1f-4a17-45ec-84fb-92fe524a29ef": "Creative",
      "594c4a08-a522-4e0e-b7ff-e4dac4b6b622": "Fashion",
      "2e74ec31-f3a4-4825-b08b-2894f6d13941": "Graphic Design Pop Art",
      "1fbb6a68-9319-44d2-8d56-2957ca0ece6a": "Graphic Design Vector",
      "97c20e5c-1af6-4d42-b227-54d03d8f0727": "HDR",
      "645e4195-f63d-4715-a3f2-3fb1e6eb8c70": "Illustration",
      "30c1d34f-e3a9-479a-b56f-c018bbc9c02a": "Macro",
      "cadc8cd6-7838-4c99-b645-df76be8ba8d8": "Minimalist",
      "621e1c9a-6319-4bee-a12d-ae40659162fa": "Moody",
      "8e2bc543-6ee2-45f9-bcd9-594b6ce84dcd": "Portrait",
      "22a9a7d2-2166-4d86-80ff-22e2643adbcf": "Pro B&W photography",
      "7c3f932b-a572-47cb-9b9b-f20211e63b5b": "Pro color photography",
      "581ba6d6-5aac-4492-bebe-54c424a0d46e": "Pro film photography",
      "0d34f8e1-46d4-428f-8ddd-4b11811fa7c9": "Portrait Fashion",
      "b504f83c-3326-4947-82e1-7fe9e839ec0f": "Ray Traced",
      "be8c6b58-739c-4d44-b9c1-b032ed308b61": "Sketch (B&W)",
      "093accc3-7633-4ffd-82da-d34000dfc0d6": "Sketch (Color)",
      "5bdc3f2a-1be6-4d1c-8e77-992a30824a2c": "Stock Photo",
      "dee282d3-891f-4f73-ba02-7f8131e5541b": "Vibrant",
      "debdf72a-91a4-467b-bf61-cc02bdeb69c6": "3D Render",
      "9fdc5e8c-4d13-49b4-9ce6-5a74cbb19177": "Bokeh",
    },
  },
  num_images: {
    options: [1, 2, 3, 4],
    default: 1,
    description: "Number of images to generate",
  },
};
