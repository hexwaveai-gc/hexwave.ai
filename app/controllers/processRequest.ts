import { v4 as uuidv4 } from "uuid";
import { updateProcessData } from "./updateProcessData";

/**
 * Generate a unique process ID and create the initial process record
 * 
 * @param data - Initial data to store with the process (userId, toolName, etc.)
 * @returns The generated process ID (UUID)
 * 
 * @example
 * const processId = await generateUniqueId({
 *   userId: "user_123",
 *   toolName: "image-generator",
 *   category: "image",
 * });
 */
export async function generateUniqueId(
  data?: Record<string, unknown>
): Promise<string> {
  const processId = uuidv4();

  const req = data ? { ...data } : {};

  await updateProcessData(processId, { req });

  return processId;
}
