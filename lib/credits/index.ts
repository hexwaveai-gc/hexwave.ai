/**
 * Credit Service
 * 
 * Provides atomic credit operations for the Hexwave.ai platform.
 * All credit deductions, refunds, and additions go through this service.
 */

import { dbConnect } from "@/lib/db";
import User from "@/app/models/User/user.model";
import CreditTransaction from "@/app/models/CreditTransaction/creditTransaction.model";
import { logInfo, logError } from "@/lib/logger";
import type {
  DeductCreditsOptions,
  RefundCreditsOptions,
  AddCreditsOptions,
  CreditOperationResult,
  UserCreditInfo,
  ToolCategory,
} from "./types";

// =============================================================================
// Credit Checking
// =============================================================================

/**
 * Get user's credit information
 */
export async function getUserCredits(userId: string): Promise<UserCreditInfo | null> {
  try {
    await dbConnect();
    const user = await User.findById(userId).select("availableBalance").lean();
    
    if (!user) {
      return null;
    }

    const availableBalance = user.availableBalance || 0;

    return {
      userId,
      availableBalance,
      hasEnoughCredits: (amount: number) => availableBalance >= amount,
    };
  } catch (error) {
    logError("Failed to get user credits", error, { userId });
    return null;
  }
}

/**
 * Check if user has enough credits for an operation
 */
export async function hasEnoughCredits(
  userId: string,
  requiredAmount: number
): Promise<{ hasEnough: boolean; availableBalance: number }> {
  try {
    await dbConnect();
    const user = await User.findById(userId).select("availableBalance").lean();
    
    if (!user) {
      return { hasEnough: false, availableBalance: 0 };
    }

    const availableBalance = user.availableBalance || 0;
    return {
      hasEnough: availableBalance >= requiredAmount,
      availableBalance,
    };
  } catch (error) {
    logError("Failed to check credits", error, { userId, requiredAmount });
    return { hasEnough: false, availableBalance: 0 };
  }
}

// =============================================================================
// Credit Deduction (Used by generateUniqueId)
// =============================================================================

/**
 * Deduct credits from user's balance atomically
 * This is called within a MongoDB transaction by generateUniqueId
 * 
 * @param options - Deduction options
 * @param session - MongoDB session for transaction
 */
export async function deductCredits(
  options: DeductCreditsOptions,
  session?: any
): Promise<CreditOperationResult> {
  const { userId, amount, processId, category, toolName, description } = options;

  try {
    await dbConnect();

    // Generate description if not provided
    const transactionDescription =
      description ||
      `${category === "image" ? "Image" : "Video"} generation with ${toolName}`;

    // Deduct from user balance
    const updateResult = await User.findByIdAndUpdate(
      userId,
      { $inc: { availableBalance: -amount } },
      { new: true, session }
    );

    if (!updateResult) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Create transaction record
    const transaction = await CreditTransaction.create(
      [
        {
          userId,
          processId,
          type: "DEDUCTION",
          amount,
          category,
          toolName,
          description: transactionDescription,
          status: "SUCCESS",
        },
      ],
      { session }
    );

    logInfo("Credits deducted successfully", {
      userId,
      processId,
      amount,
      toolName,
      newBalance: updateResult.availableBalance,
    });

    return {
      success: true,
      transactionId: transaction[0]._id.toString(),
      newBalance: updateResult.availableBalance,
    };
  } catch (error) {
    logError("Failed to deduct credits", error, {
      userId,
      processId,
      amount,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// Credit Refund (Used by updateProcessData on failure)
// =============================================================================

/**
 * Refund credits to user's balance
 * Includes idempotency check to prevent duplicate refunds
 * 
 * @param options - Refund options
 */
export async function refundCredits(
  options: RefundCreditsOptions
): Promise<CreditOperationResult> {
  const { userId, amount, processId, category, toolName, description } = options;

  try {
    await dbConnect();

    // Idempotency check: Has this process already been refunded?
    const existingRefund = await CreditTransaction.findOne({
      processId,
      type: "REFUND",
      status: "SUCCESS",
    });

    if (existingRefund) {
      logInfo("Refund already processed, skipping", { processId, userId });
      return {
        success: true,
        transactionId: existingRefund._id.toString(),
        error: "Already refunded",
      };
    }

    // Generate description if not provided
    const transactionDescription =
      description ||
      `Refund for failed ${category === "image" ? "image" : "video"} generation with ${toolName}`;

    // Use a transaction for atomicity
    const session = await User.startSession();
    let result: CreditOperationResult = { success: false };

    try {
      await session.withTransaction(async () => {
        // Add credits back to user
        const updateResult = await User.findByIdAndUpdate(
          userId,
          { $inc: { availableBalance: amount } },
          { new: true, session }
        );

        if (!updateResult) {
          throw new Error("User not found for refund");
        }

        // Create refund transaction record
        const transaction = await CreditTransaction.create(
          [
            {
              userId,
              processId,
              type: "REFUND",
              amount,
              category,
              toolName,
              description: transactionDescription,
              status: "SUCCESS",
            },
          ],
          { session }
        );

        result = {
          success: true,
          transactionId: transaction[0]._id.toString(),
          newBalance: updateResult.availableBalance,
        };

        logInfo("Credits refunded successfully", {
          userId,
          processId,
          amount,
          toolName,
          newBalance: updateResult.availableBalance,
        });
      });
    } finally {
      await session.endSession();
    }

    return result;
  } catch (error) {
    logError("Failed to refund credits", error, {
      userId,
      processId,
      amount,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// Credit Addition (For subscriptions/purchases)
// =============================================================================

/**
 * Add credits to user's balance
 * Used when user subscribes, purchases credits, or receives promo credits
 * 
 * @param options - Addition options
 */
export async function addCredits(
  options: AddCreditsOptions
): Promise<CreditOperationResult> {
  const { userId, amount, description, source = "purchase" } = options;

  try {
    await dbConnect();

    // Use a transaction for atomicity
    const session = await User.startSession();
    let result: CreditOperationResult = { success: false };

    try {
      await session.withTransaction(async () => {
        // Add credits to user
        const updateResult = await User.findByIdAndUpdate(
          userId,
          { $inc: { availableBalance: amount } },
          { new: true, session, upsert: false }
        );

        if (!updateResult) {
          throw new Error("User not found");
        }

        // Create transaction record
        const transaction = await CreditTransaction.create(
          [
            {
              userId,
              processId: null, // No process associated with credit addition
              type: "CREDIT_ADDED",
              amount,
              category: null,
              toolName: null,
              description: description || `Credits added via ${source}`,
              status: "SUCCESS",
            },
          ],
          { session }
        );

        result = {
          success: true,
          transactionId: transaction[0]._id.toString(),
          newBalance: updateResult.availableBalance,
        };

        logInfo("Credits added successfully", {
          userId,
          amount,
          source,
          newBalance: updateResult.availableBalance,
        });
      });
    } finally {
      await session.endSession();
    }

    return result;
  } catch (error) {
    logError("Failed to add credits", error, {
      userId,
      amount,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// Transaction History
// =============================================================================

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
  userId: string,
  options: {
    limit?: number;
    skip?: number;
    type?: "DEDUCTION" | "REFUND" | "CREDIT_ADDED";
    startDate?: Date;
    endDate?: Date;
  } = {}
) {
  try {
    await dbConnect();
    return await CreditTransaction.findByUser(userId, options);
  } catch (error) {
    logError("Failed to get transaction history", error, { userId });
    return [];
  }
}

/**
 * Get transaction summary for a user
 */
export async function getTransactionSummary(
  userId: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    await dbConnect();
    return await CreditTransaction.getTransactionSummary(userId, startDate, endDate);
  } catch (error) {
    logError("Failed to get transaction summary", error, { userId });
    return {
      totalDeducted: 0,
      totalRefunded: 0,
      totalAdded: 0,
      netChange: 0,
    };
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate a human-readable description for a credit transaction
 */
export function generateTransactionDescription(
  type: "DEDUCTION" | "REFUND" | "CREDIT_ADDED",
  category: ToolCategory | null,
  toolName: string | null
): string {
  if (type === "CREDIT_ADDED") {
    return "Credits added to account";
  }

  const toolLabel = toolName || "Unknown tool";
  const categoryLabel = category === "image" ? "Image" : category === "video" ? "Video" : "Content";

  if (type === "DEDUCTION") {
    return `${categoryLabel} generation with ${toolLabel}`;
  }

  if (type === "REFUND") {
    return `Refund for failed ${categoryLabel.toLowerCase()} generation with ${toolLabel}`;
  }

  return "Credit transaction";
}

