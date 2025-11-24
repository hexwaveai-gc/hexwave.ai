const lumaPhotonFlashSettings = {
  prompt: {
    description: "Text prompt describing the desired image",
    required: true,
  },
  aspect_ratio: {
    options: ["1:1", "3:4", "4:3", "9:16", "16:9", "9:21", "21:9"],
    default: "16:9",
    description: "The aspect ratio of your output image",
  },
};

export default lumaPhotonFlashSettings;
