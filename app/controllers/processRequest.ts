/**
 * Process Request Controller
 *
 * Handles process creation with credit deduction via CreditService.
 * All tool usage (image/video generation) goes through generateUniqueId(),
 * which ensures credits are available and deducted before processing starts.
 */

import { v4 as uuidv4 } from "uuid";
import { dbConnect } from "@/lib/db";
import ProcessRequest from "@/app/models/processRequest/processRequestmodel";
import { CreditService } from "@/lib/services/CreditService";
import { logInfo, logError } from "@/lib/logger";
import type {
  GenerateProcessOptions,
  GenerateProcessResult,
} from "@/lib/types/process";

/**
 * Generate a human-readable description for a credit transaction
 */
function generateTransactionDescription(
  category: string | null,
  toolName: string | null
): string {
  const toolLabel = toolName || "Unknown tool";
  const categoryLabel =
    category === "image"
      ? "Image"
      : category === "video"
        ? "Video"
        : "Content";

  return `${categoryLabel} generation with ${toolLabel}`;
}

/**
 * Generate a unique process ID with credit deduction via CreditService
 *
 * This function performs the following:
 * 1. Validates user exists and has sufficient credits (via CreditService)
 * 2. Deducts credits from user's balance (via CreditService)
 * 3. Creates the process record with credit info
 * 4. If process creation fails, refunds credits automatically
 *
 * @param options - Process creation options including credit info
 * @returns Result object with processId on success, or error details on failure
 *
 * @example
 * const result = await generateUniqueId({
 *   userId: "user_123",
 *   creditsToDeduct: 10,
 *   category: "image",
 *   toolName: "flux-pro",
 *   data: { prompt: "A beautiful sunset" }
 * });
 *
 * if (result.success) {
 *   console.log("Process ID:", result.processId);
 * } else {
 *   console.error("Error:", result.error, result.message);
 * }
 */
export async function generateUniqueId(
  options: GenerateProcessOptions
): Promise<GenerateProcessResult> {
  const { userId, creditsToDeduct, category, toolName, data } = options;

  // Validate required fields
  if (!userId) {
    return {
      success: false,
      error: "TRANSACTION_FAILED",
      message: "User ID is required",
    };
  }

  if (creditsToDeduct <= 0) {
    return {
      success: false,
      error: "TRANSACTION_FAILED",
      message: "Credits to deduct must be greater than 0",
    };
  }

  const processId = uuidv4();
  const idempotencyKey = `process_${processId}`;

  try {
    await dbConnect();

    // Step 1: Validate balance first (fast check without deducting)
    const validation = await CreditService.validateBalance(userId, creditsToDeduct);
    
    if (!validation.valid) {
      return {
        success: false,
        error: "INSUFFICIENT_CREDITS",
        message: `Insufficient credits. Required: ${creditsToDeduct}, Available: ${validation.balance}`,
        availableCredits: validation.balance,
      };
    }

    // Step 2: Deduct credits using CreditService
    const description = generateTransactionDescription(category, toolName);
    
    const deductResult = await CreditService.deductCredits({
      userId,
      amount: creditsToDeduct,
      description,
      usageDetails: {
        operation_type: `${category}_generation`,
        model_id: toolName || undefined,
        generation_id: processId,
      },
      idempotencyKey,
    });

    if (!deductResult.success) {
      // Map CreditService error codes to our error types
      const errorType = deductResult.error_code === "INSUFFICIENT_BALANCE" 
        ? "INSUFFICIENT_CREDITS" 
        : deductResult.error_code === "USER_NOT_FOUND"
          ? "USER_NOT_FOUND"
          : "TRANSACTION_FAILED";

      return {
        success: false,
        error: errorType,
        message: deductResult.error || "Failed to deduct credits",
        availableCredits: deductResult.balance_before,
      };
    }

    // Step 3: Create process record
    try {
      await ProcessRequest.create({
        processId,
        userId,
        status: "processing",
        creditsUsed: creditsToDeduct,
        category,
        toolName,
        data: {
          req: data || {},
        },
      });

      logInfo("Process created with credit deduction via CreditService", {
        processId,
        userId,
        creditsToDeduct,
        category,
        toolName,
        transactionRef: deductResult.transaction_ref,
        balanceBefore: deductResult.balance_before,
        balanceAfter: deductResult.balance_after,
      });

      return {
        success: true,
        processId,
        transactionRef: deductResult.transaction_ref,
      };

    } catch (processError) {
      // Process creation failed - refund the credits
      logError("Process creation failed, refunding credits", processError, {
        processId,
        userId,
        creditsToDeduct,
      });

      const refundResult = await CreditService.refundCredits({
        userId,
        amount: creditsToDeduct,
        description: `Refund: Failed to create process ${processId}`,
        relatedTransactionRef: deductResult.transaction_ref,
        source: "system",
        metadata: {
          reason: "process_creation_failed",
          original_process_id: processId,
        },
      });

      if (refundResult.success) {
        logInfo("Credits refunded after process creation failure", {
          processId,
          userId,
          refundedAmount: creditsToDeduct,
        });
      } else {
        logError("Failed to refund credits after process creation failure", null, {
          processId,
          userId,
          creditsToDeduct,
          refundError: refundResult.error,
        });
      }

      return {
        success: false,
        error: "TRANSACTION_FAILED",
        message: "Failed to create process record",
      };
    }

  } catch (error) {
    logError("Failed to create process with credit deduction", error, {
      processId,
      userId,
      creditsToDeduct,
    });

    return {
      success: false,
      error: "TRANSACTION_FAILED",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get process data by processId
 * Useful for retrieving credit info for refunds
 */
export async function getProcessById(processId: string) {
  try {
    await dbConnect();
    return await ProcessRequest.findOne({ processId }).lean();
  } catch (error) {
    logError("Failed to get process by ID", error, { processId });
    return null;
  }
}
