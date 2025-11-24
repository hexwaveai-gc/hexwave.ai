export const dalleSettings = {
  "dall-e-3": {
    aspectRatios: {
      options: [
        { value: "1:1", label: "Square (1024x1024)" },
        { value: "16:9", label: "Landscape (1792x1024)" },
        { value: "9:16", label: "Portrait (1024x1792)" },
      ],
      default: "1:1",
    },
  },
};

export const generateDalleImage = async (params) => {
  const {
    model,
    openai, // We'll use OpenAI for DALL-E
    prompt,
    numImages = 1,
    aspect_ratio = "1024x1024", // DALL-E uses specific dimensions
  } = params;

  if (!openai) {
    throw new Error("OpenAI client is required for DALL-E models");
  }

  try {
    // Convert aspect ratio to size for DALL-E
    const size =
      aspect_ratio === "1:1"
        ? "1024x1024"
        : aspect_ratio === "16:9"
          ? "1792x1024"
          : aspect_ratio === "9:16"
            ? "1024x1792"
            : "1024x1024"; // default to square if not specified

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: numImages,
      size,
      quality: "standard",
      response_format: "b64_json",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No output received from DALL-E");
    }

    return response.data.map((image) => Buffer.from(image.b64_json, "base64"));
  } catch (error) {
    console.error("DALL-E generation error:", error);
    throw new Error(`${model} generation failed: ${error.message}`);
  }
};
