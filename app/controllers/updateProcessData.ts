"use server";
import { dbConnect } from "@/lib/db";

import ProcessRequest from "@/app/models/processRequest/processRequestmodel";
import { publishProcessStatus } from "@/lib/ably";
import { logInfo, logError } from "@/lib/logger";

// Retry helper function with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      logError(`Retry attempt ${attempt}/${maxRetries} failed`, error, {
        attempt,
        maxRetries,
      });

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay =
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      logInfo(`Retrying operation`, { delay, attempt, maxRetries });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Publish status update to Ably channel for real-time frontend updates
 * Non-blocking - errors are logged but don't fail the main operation
 */
async function notifyProcessStatus(
  processId: string,
  status: "processing" | "completed" | "failed",
  data?: Record<string, unknown>,
  error?: string
): Promise<void> {
  try {
    await publishProcessStatus(processId, {
      status,
      data,
      error,
    });
    logInfo("Published process status to Ably", { processId, status });
  } catch (ablyError) {
    // Log but don't throw - Ably notification should not break the main flow
    logError("Failed to publish process status to Ably", ablyError, {
      processId,
      status,
    });
  }
}

export async function updateProcessData(
  processId: string,
  data?: Record<string, unknown>,
  status?: "processing" | "completed" | "failed"
): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  try {
    if (!processId) {
      return {
        success: false,
        error: "Process ID is required",
      };
    }

    return await withRetry(async () => {
      await dbConnect();
      // First, check if a record exists
      const existingProcess = await (ProcessRequest as any).findOne({
        processId,
      });

      if (!existingProcess) {
        await (ProcessRequest as any).create({
          processId,
          status: status || "processing",
          data: data,
        });

        // Notify via Ably for new process
        if (status && status !== "processing") {
          await notifyProcessStatus(processId, status, data);
        }

        return {
          success: true,
          data: {
            processId,
            status: status || "processing",
            data: data,
          },
        };
      }

      const processData = {
        processId,
        status: status || "processing",
        data: existingProcess
          ? { ...existingProcess.data, ...data } // Merge existing data with new data
          : data,
        updatedAt: new Date(),
      };

      logInfo("Updating process data", { processId, status });
      const updatedProcess = await (ProcessRequest as any).findOneAndUpdate(
        { processId },
        processData,
        { new: true, upsert: true }
      );

      // Publish to Ably for completed or failed status
      if (status === "completed" || status === "failed") {
        await notifyProcessStatus(
          processId,
          status,
          processData.data as Record<string, unknown>,
          status === "failed" ? (data?.error as string) : undefined
        );
      }

      return {
        success: true,
        data: updatedProcess,
      };
    });
  } catch (error) {
    logError("Failed to update process data after all retries", error, {
      processId,
      status,
    });

    // Try to notify about failure via Ably
    if (status === "failed" || !status) {
      await notifyProcessStatus(processId, "failed", undefined, "Process update failed");
    }

    return {
      success: false,
      error: "Failed to update process data",
    };
  }
}

export async function getProcessData(processId: string) {
  return await withRetry(async () => {
    await dbConnect();
    const processData = await (ProcessRequest as any).findOne({ processId });
    return processData;
  });
}

export async function updateProcessDataWithImageCount(
  processId: string,
  options: {
    newImages?: string[];
    error?: string;
    status: "failed" | "processing" | "completed";
    totalExpectedImages: number;
    failedImagesCount?: number;
  }
) {
  try {
    return await withRetry(async () => {
      await dbConnect();

      const {
        newImages = [],
        error,
        status,
        totalExpectedImages,
        failedImagesCount = 0,
      } = options;

      // Use MongoDB transaction for atomic updates
      const session = await ProcessRequest.startSession();
      let result: any;

      await session.withTransaction(async () => {
        // Get current state within transaction
        const currentProcess = await (ProcessRequest as any)
          .findOne({ processId })
          .session(session);

        const version = currentProcess?.data?.req?.version;

        const updateOperation: Record<string, unknown> = {
          $set: {
            updatedAt: new Date(),
          },
          $inc: {},
        };

        // Handle failed status
        if (status === "failed") {
          (updateOperation.$inc as Record<string, number>)[
            "data.failedImagesCount"
          ] = 1;
          (updateOperation.$set as Record<string, unknown>)["data.error"] =
            error;
        }

        // Handle successful images
        else if (newImages.length > 0) {
          if (version === "1") {
            (updateOperation as Record<string, unknown>).$push = {
              "data.generations": {
                $each: newImages,
                $position: currentProcess?.data?.generations?.length || 0,
              },
            };
          } else {
            (updateOperation as Record<string, unknown>).$push = {
              "data.generatedImages": {
                $each: newImages,
                $position: currentProcess?.data?.generatedImages?.length || 0,
              },
            };
          }

          (updateOperation.$inc as Record<string, number>)[
            "data.completedImagesCount"
          ] = newImages.length;
        }

        // Calculate new total
        const newTotal =
          (currentProcess?.data?.completedImagesCount || 0) +
          newImages.length +
          (currentProcess?.data?.failedImagesCount || 0) +
          failedImagesCount;

        // Update status if we've reached the total
        if (newTotal >= totalExpectedImages) {
          (updateOperation.$set as Record<string, unknown>).status =
            "completed";
        }

        result = await (ProcessRequest as any).findOneAndUpdate(
          { processId },
          updateOperation,
          { new: true, session }
        );

        // Notify via Ably if process completed or failed
        if (newTotal >= totalExpectedImages || status === "failed") {
          const finalStatus = status === "failed" ? "failed" : "completed";
          await notifyProcessStatus(
            processId,
            finalStatus,
            result?.data as Record<string, unknown>,
            status === "failed" ? error : undefined
          );
        }
      });

      await session.endSession();

      return {
        success: true,
        data: result,
      };
    });
  } catch (error) {
    logError(
      "Error updating process data with image count after retries:",
      error
    );

    // Notify about failure via Ably
    await notifyProcessStatus(
      processId,
      "failed",
      undefined,
      options.error || "Process update failed"
    );

    return {
      success: false,
      error: "Failed to update process data",
    };
  }
}
