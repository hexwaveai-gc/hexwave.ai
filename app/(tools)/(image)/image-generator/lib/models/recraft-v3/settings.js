const recraftV3Settings = {
  prompt: {
    description: "Text prompt for image generation",
    required: true,
  },
  size: {
    options: [
      "square_hd",

      "portrait_4_3",
      "portrait_16_9",
      "landscape_4_3",
      "landscape_16_9",
    ],
    default: "square_hd",
    description: "Size of the generated image",
  },
  style: {
    options: [
      "any",
      "realistic_image",
      "digital_illustration",
      "digital_illustration/pixel_art",
      "digital_illustration/hand_drawn",
      "digital_illustration/grain",
      "digital_illustration/infantile_sketch",
      "digital_illustration/2d_art_poster",
      "digital_illustration/handmade_3d",
      "digital_illustration/hand_drawn_outline",
      "digital_illustration/engraving_color",
      "digital_illustration/2d_art_poster_2",
      "realistic_image/b_and_w",
      "realistic_image/hard_flash",
      "realistic_image/hdr",
      "realistic_image/natural_light",
      "realistic_image/studio_portrait",
      "realistic_image/enterprise",
      "realistic_image/motion_blur",
    ],
    default: "any",
    description: "Style of the generated image",
  },
};

export default recraftV3Settings;
