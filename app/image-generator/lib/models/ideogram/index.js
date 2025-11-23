export const generateIdeogramImage = async (params) => {
  const { model, replicate, ...inputParams } = params;

  try {
    const modelEndpoint = `ideogram-ai/${model}`;
    const output = await replicate.run(modelEndpoint, {
      input: inputParams,
    });

    // Process image URLs to buffers
    return await Promise.all(
      (Array.isArray(output) ? output : [output]).map(async (imageUrl) => {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }),
    );
  } catch (error) {
    const errorMessage = error.message.split(" --> ")[0];
    throw new Error(`${model} generation failed: ${errorMessage}`);
  }
};
