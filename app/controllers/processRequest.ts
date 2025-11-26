/**
 * Process Request Controller
 * 
 * Handles process creation with atomic credit deduction.
 * All tool usage (image/video generation) goes through generateUniqueId(),
 * which ensures credits are available and deducted before processing starts.
 */

import { v4 as uuidv4 } from "uuid";
import { dbConnect } from "@/lib/db";
import User from "@/app/models/User/user.model";
import ProcessRequest from "@/app/models/processRequest/processRequestmodel";
import CreditTransaction from "@/app/models/CreditTransaction/creditTransaction.model";
import { logInfo, logError } from "@/lib/logger";
import { generateTransactionDescription } from "@/lib/credits";
import type {
  GenerateProcessOptions,
  GenerateProcessResult,
} from "@/lib/credits/types";

/**
 * Generate a unique process ID with atomic credit deduction
 * 
 * This function performs the following atomically within a MongoDB transaction:
 * 1. Validates user exists and has sufficient credits
 * 2. Deducts credits from user's balance
 * 3. Creates the process record with credit info
 * 4. Creates a credit transaction record
 * 
 * If any step fails, all changes are rolled back.
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

  try {
    await dbConnect();

    // Start MongoDB session for transaction
    const session = await ProcessRequest.startSession();
    let result: GenerateProcessResult = {
      success: false,
      error: "TRANSACTION_FAILED",
      message: "Transaction failed",
    };

    try {
      await session.withTransaction(async () => {
        // Step 1: Find user and check balance
        const user = await User.findById(userId)
          .select("availableBalance")
          .session(session);

        if (!user) {
          result = {
            success: false,
            error: "USER_NOT_FOUND",
            message: "User not found",
          };
          throw new Error("USER_NOT_FOUND");
        }

        const availableBalance = user.availableBalance || 0;

        // Step 2: Check if user has sufficient credits
        if (availableBalance < creditsToDeduct) {
          result = {
            success: false,
            error: "INSUFFICIENT_CREDITS",
            message: `Insufficient credits. Required: ${creditsToDeduct}, Available: ${availableBalance}`,
            availableCredits: availableBalance,
          };
          throw new Error("INSUFFICIENT_CREDITS");
        }

        // Step 3: Deduct credits from user balance
        await User.findByIdAndUpdate(
          userId,
          { $inc: { availableBalance: -creditsToDeduct } },
          { session }
        );

        // Step 4: Create process record with credit info
        await ProcessRequest.create(
          [
            {
              processId,
              userId,
              status: "processing",
              creditsUsed: creditsToDeduct,
              category,
              toolName,
              data: {
                req: data || {},
              },
            },
          ],
          { session }
        );

        // Step 5: Create credit transaction record
        const transactionDescription = generateTransactionDescription(
          "DEDUCTION",
          category,
          toolName
        );

        await CreditTransaction.create(
          [
            {
              userId,
              processId,
              type: "DEDUCTION",
              amount: creditsToDeduct,
              category,
              toolName,
              description: transactionDescription,
              status: "SUCCESS",
            },
          ],
          { session }
        );

        // Success - set result
        result = {
          success: true,
          processId,
        };

        logInfo("Process created with credit deduction", {
          processId,
          userId,
          creditsToDeduct,
          category,
          toolName,
        });
      });
    } catch (transactionError) {
      // Transaction was aborted - result already set with specific error
      const errorMessage =
        transactionError instanceof Error
          ? transactionError.message
          : "Unknown error";

      // Only log if it's not an expected error (insufficient credits, user not found)
      if (
        errorMessage !== "INSUFFICIENT_CREDITS" &&
        errorMessage !== "USER_NOT_FOUND"
      ) {
        logError("Transaction failed during process creation", transactionError, {
          processId,
          userId,
          creditsToDeduct,
        });
      }
    } finally {
      await session.endSession();
    }

    return result;
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
