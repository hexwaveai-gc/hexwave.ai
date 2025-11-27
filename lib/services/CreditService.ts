/**
 * CreditService - Centralized Credit Management
 * 
 * Handles all credit operations with:
 * - Double-entry bookkeeping (ledger + user balance)
 * - Idempotency protection
 * - Balance validation
 * - Audit trail
 * - Paddle sync fallback
 */

import { v4 as uuidv4 } from "uuid";
import User, { type IUser } from "@/app/models/User/user.model";
import CreditLedger, {
  type ICreditLedgerEntry,
  type CreditTransactionType,
  type CreditSource,
  type IUsageDetails,
} from "@/app/models/CreditLedger/credit-ledger.model";
import { dbConnect } from "@/lib/db";
import { getCreditsForPrice, getPlanNameFromPriceId } from "@/constants/paddle";
import { getPaddleClient } from "@/lib/paddle/client";

// Result type for credit operations
export interface CreditOperationResult {
  success: boolean;
  transaction_ref?: string;
  balance_before: number;
  balance_after: number;
  amount: number;
  error?: string;
  error_code?: string;
}

// Input types for different operations
export interface AddCreditsInput {
  userId: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  source: CreditSource;
  transactionId?: string;
  subscriptionId?: string;
  customerId?: string;
  priceId?: string;
  productId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface DeductCreditsInput {
  userId: string;
  amount: number;
  description: string;
  usageDetails?: IUsageDetails;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface RefundCreditsInput {
  userId: string;
  amount: number;
  description: string;
  relatedTransactionRef?: string;
  transactionId?: string;
  source?: CreditSource;
  metadata?: Record<string, any>;
}

/**
 * CreditService Class
 * 
 * Singleton service for all credit operations
 */
class CreditServiceClass {
  private static instance: CreditServiceClass;

  private constructor() {}

  public static getInstance(): CreditServiceClass {
    if (!CreditServiceClass.instance) {
      CreditServiceClass.instance = new CreditServiceClass();
    }
    return CreditServiceClass.instance;
  }

  /**
   * Generate unique transaction reference
   */
  private generateTransactionRef(): string {
    const timestamp = Date.now().toString(36);
    const random = uuidv4().split("-")[0];
    return `txn_${timestamp}_${random}`;
  }

  /**
   * Add credits to user account
   * 
   * Used for: subscriptions, renewals, purchases, bonuses
   */
  async addCredits(input: AddCreditsInput): Promise<CreditOperationResult> {
    await dbConnect();

    const {
      userId,
      amount,
      type,
      description,
      source,
      transactionId,
      subscriptionId,
      customerId,
      priceId,
      productId,
      idempotencyKey,
      metadata,
    } = input;

    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        balance_before: 0,
        balance_after: 0,
        amount: 0,
        error: "Amount must be positive",
        error_code: "INVALID_AMOUNT",
      };
    }

    try {
      // Check idempotency if key provided
      if (idempotencyKey) {
        const existing = await CreditLedger.findOne({ idempotency_key: idempotencyKey });
        if (existing) {
          console.log(`[CreditService] Duplicate transaction detected: ${idempotencyKey}`);
          return {
            success: true,
            transaction_ref: existing.transaction_ref,
            balance_before: existing.balance_before,
            balance_after: existing.balance_after,
            amount: existing.amount,
          };
        }
      }

      // Check transaction idempotency
      if (transactionId) {
        const existing = await CreditLedger.findOne({ 
          transaction_id: transactionId,
          type: { $in: ["subscription_credit", "subscription_renewal", "addon_purchase"] }
        });
        if (existing) {
          console.log(`[CreditService] Transaction already processed: ${transactionId}`);
          return {
            success: true,
            transaction_ref: existing.transaction_ref,
            balance_before: existing.balance_before,
            balance_after: existing.balance_after,
            amount: existing.amount,
          };
        }
      }

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          balance_before: 0,
          balance_after: 0,
          amount: 0,
          error: "User not found",
          error_code: "USER_NOT_FOUND",
        };
      }

      const balanceBefore = user.credits || 0;
      const balanceAfter = balanceBefore + amount;
      const transactionRef = this.generateTransactionRef();

      // Create ledger entry
      const ledgerEntry: Partial<ICreditLedgerEntry> = {
        user_id: userId,
        transaction_ref: transactionRef,
        type,
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        status: "completed",
        source,
        description,
        transaction_id: transactionId,
        subscription_id: subscriptionId,
        customer_id: customerId,
        price_id: priceId,
        product_id: productId,
        idempotency_key: idempotencyKey,
        metadata: metadata ? new Map(Object.entries(metadata)) : undefined,
      };

      // Save ledger entry
      await CreditLedger.create(ledgerEntry);

      // Update user balance
      await User.findByIdAndUpdate(userId, {
        $set: {
          credits: balanceAfter,
          balance_verified_at: new Date(),
        },
      });

      console.log(`[CreditService] Added ${amount} credits to user ${userId}. Balance: ${balanceBefore} -> ${balanceAfter}`);

      return {
        success: true,
        transaction_ref: transactionRef,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        amount,
      };

    } catch (error) {
      console.error("[CreditService] Error adding credits:", error);
      return {
        success: false,
        balance_before: 0,
        balance_after: 0,
        amount: 0,
        error: error instanceof Error ? error.message : "Unknown error",
        error_code: "INTERNAL_ERROR",
      };
    }
  }

  /**
   * Deduct credits from user account
   * 
   * Used for: usage/generation costs
   */
  async deductCredits(input: DeductCreditsInput): Promise<CreditOperationResult> {
    await dbConnect();

    const {
      userId,
      amount,
      description,
      usageDetails,
      idempotencyKey,
      metadata,
    } = input;

    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        balance_before: 0,
        balance_after: 0,
        amount: 0,
        error: "Amount must be positive",
        error_code: "INVALID_AMOUNT",
      };
    }

    try {
      // Check idempotency
      if (idempotencyKey) {
        const existing = await CreditLedger.findOne({ idempotency_key: idempotencyKey });
        if (existing) {
          return {
            success: true,
            transaction_ref: existing.transaction_ref,
            balance_before: existing.balance_before,
            balance_after: existing.balance_after,
            amount: Math.abs(existing.amount),
          };
        }
      }

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          balance_before: 0,
          balance_after: 0,
          amount: 0,
          error: "User not found",
          error_code: "USER_NOT_FOUND",
        };
      }

      const balanceBefore = user.credits || 0;

      // Check sufficient balance
      if (balanceBefore < amount) {
        return {
          success: false,
          balance_before: balanceBefore,
          balance_after: balanceBefore,
          amount: 0,
          error: "Insufficient credits",
          error_code: "INSUFFICIENT_BALANCE",
        };
      }

      const balanceAfter = balanceBefore - amount;
      const transactionRef = this.generateTransactionRef();

      // Create ledger entry (negative amount for deduction)
      const ledgerEntry: Partial<ICreditLedgerEntry> = {
        user_id: userId,
        transaction_ref: transactionRef,
        type: "usage_deduction",
        amount: -amount, // Negative for deductions
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        status: "completed",
        source: "api",
        description,
        usage_details: usageDetails,
        idempotency_key: idempotencyKey,
        metadata: metadata ? new Map(Object.entries(metadata)) : undefined,
      };

      // Save ledger entry
      await CreditLedger.create(ledgerEntry);

      // Update user balance
      await User.findByIdAndUpdate(userId, {
        $set: {
          credits: balanceAfter,
          balance_verified_at: new Date(),
        },
      });

      console.log(`[CreditService] Deducted ${amount} credits from user ${userId}. Balance: ${balanceBefore} -> ${balanceAfter}`);

      return {
        success: true,
        transaction_ref: transactionRef,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        amount,
      };

    } catch (error) {
      console.error("[CreditService] Error deducting credits:", error);
      return {
        success: false,
        balance_before: 0,
        balance_after: 0,
        amount: 0,
        error: error instanceof Error ? error.message : "Unknown error",
        error_code: "INTERNAL_ERROR",
      };
    }
  }

  /**
   * Refund credits to user account
   * 
   * Used for: failed generations, payment refunds
   */
  async refundCredits(input: RefundCreditsInput): Promise<CreditOperationResult> {
    await dbConnect();

    const {
      userId,
      amount,
      description,
      relatedTransactionRef,
      transactionId,
      source = "system",
      metadata,
    } = input;

    if (amount <= 0) {
      return {
        success: false,
        balance_before: 0,
        balance_after: 0,
        amount: 0,
        error: "Amount must be positive",
        error_code: "INVALID_AMOUNT",
      };
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          balance_before: 0,
          balance_after: 0,
          amount: 0,
          error: "User not found",
          error_code: "USER_NOT_FOUND",
        };
      }

      const balanceBefore = user.credits || 0;
      const balanceAfter = balanceBefore + amount;
      const transactionRef = this.generateTransactionRef();

      // Create ledger entry
      const ledgerEntry: Partial<ICreditLedgerEntry> = {
        user_id: userId,
        transaction_ref: transactionRef,
        type: "refund",
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        status: "completed",
        source,
        description,
        transaction_id: transactionId,
        related_transaction_ref: relatedTransactionRef,
        metadata: metadata ? new Map(Object.entries(metadata)) : undefined,
      };

      await CreditLedger.create(ledgerEntry);

      await User.findByIdAndUpdate(userId, {
        $set: {
          credits: balanceAfter,
          balance_verified_at: new Date(),
        },
      });

      console.log(`[CreditService] Refunded ${amount} credits to user ${userId}. Balance: ${balanceBefore} -> ${balanceAfter}`);

      return {
        success: true,
        transaction_ref: transactionRef,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        amount,
      };

    } catch (error) {
      console.error("[CreditService] Error refunding credits:", error);
      return {
        success: false,
        balance_before: 0,
        balance_after: 0,
        amount: 0,
        error: error instanceof Error ? error.message : "Unknown error",
        error_code: "INTERNAL_ERROR",
      };
    }
  }

  /**
   * Get user's current balance
   */
  async getBalance(userId: string): Promise<number> {
    await dbConnect();
    const user = await User.findById(userId).select("credits");
    return user?.credits || 0;
  }

  /**
   * Validate if user has sufficient balance
   */
  async validateBalance(userId: string, requiredAmount: number): Promise<{
    valid: boolean;
    balance: number;
    shortfall: number;
  }> {
    const balance = await this.getBalance(userId);
    const valid = balance >= requiredAmount;
    const shortfall = valid ? 0 : requiredAmount - balance;
    return { valid, balance, shortfall };
  }

  /**
   * Get user's credit transaction history
   */
  async getTransactionHistory(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: CreditTransactionType | CreditTransactionType[];
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ICreditLedgerEntry[]> {
    await dbConnect();

    const query: Record<string, any> = { user_id: userId };

    if (options?.type) {
      query.type = Array.isArray(options.type) 
        ? { $in: options.type } 
        : options.type;
    }

    if (options?.startDate || options?.endDate) {
      query.createdAt = {};
      if (options.startDate) query.createdAt.$gte = options.startDate;
      if (options.endDate) query.createdAt.$lte = options.endDate;
    }

    const transactions = await CreditLedger.find(query)
      .sort({ createdAt: -1 })
      .skip(options?.offset || 0)
      .limit(options?.limit || 50)
      .lean();

    return transactions as ICreditLedgerEntry[];
  }

  /**
   * Verify and reconcile user balance against ledger
   * 
   * This calculates expected balance from all ledger entries
   * and compares with stored balance
   */
  async verifyBalance(userId: string): Promise<{
    isValid: boolean;
    storedBalance: number;
    calculatedBalance: number;
    discrepancy: number;
  }> {
    await dbConnect();

    const user = await User.findById(userId).select("credits");
    const storedBalance = user?.credits || 0;

    // Calculate balance from ledger
    const result = await CreditLedger.aggregate([
      { $match: { user_id: userId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const calculatedBalance = result[0]?.total || 0;
    const discrepancy = storedBalance - calculatedBalance;

    return {
      isValid: Math.abs(discrepancy) < 0.01, // Allow tiny floating point differences
      storedBalance,
      calculatedBalance,
      discrepancy,
    };
  }

  /**
   * Sync credits from Paddle
   * 
   * Checks Paddle for any transactions not in our ledger and adds them
   */
  async syncFromPaddle(userId: string, email: string): Promise<{
    synced: boolean;
    creditsAdded: number;
    transactions: string[];
  }> {
    await dbConnect();

    try {
      const paddle = getPaddleClient();
      
      // Get user's Paddle customer ID
      const user = await User.findById(userId);
      if (!user?.customerId) {
        return { synced: false, creditsAdded: 0, transactions: [] };
      }

      // Get subscriptions for this customer
      const subscriptions = await paddle.subscriptions.list({
        customerId: [user.customerId],
        status: ["active", "trialing"],
      });

      let totalCreditsAdded = 0;
      const syncedTransactions: string[] = [];

      // For each active subscription, check if we have the transaction
      for await (const subscription of subscriptions) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transactionId = (subscription as any).firstTransactionId;
        
        if (!transactionId) continue;

        // Check if transaction already processed in CreditLedger
        const existsInLedger = await CreditLedger.exists({
          transaction_id: transactionId,
        });

        if (!existsInLedger) {
          // Get transaction details
          const transaction = await paddle.transactions.get(transactionId);
          
          // Calculate credits
          let credits = 0;
          for (const item of transaction.items || []) {
            const priceId = item.price?.id;
            if (priceId) {
              credits += getCreditsForPrice(priceId, item.quantity || 1);
            }
          }

          if (credits > 0) {
            const result = await this.addCredits({
              userId,
              amount: credits,
              type: "sync_adjustment",
              description: `Paddle sync: ${getPlanNameFromPriceId(transaction.items?.[0]?.price?.id || "")} subscription`,
              source: "sync",
              transactionId: transactionId,
              subscriptionId: subscription.id,
              customerId: user.customerId,
              metadata: { sync_reason: "paddle_fallback" },
            });

            if (result.success) {
              totalCreditsAdded += credits;
              syncedTransactions.push(transactionId);
            }
          }
        }
      }

      return {
        synced: true,
        creditsAdded: totalCreditsAdded,
        transactions: syncedTransactions,
      };

    } catch (error) {
      console.error("[CreditService] Error syncing from Paddle:", error);
      return { synced: false, creditsAdded: 0, transactions: [] };
    }
  }

  /**
   * Get credit usage summary for dashboard
   */
  async getUsageSummary(userId: string, days: number = 30): Promise<{
    totalCredits: number;
    totalUsed: number;
    totalAdded: number;
    totalRefunded: number;
    byType: Record<string, number>;
    dailyUsage: Array<{ date: string; used: number; added: number }>;
  }> {
    await dbConnect();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate by type
    const byTypeResult = await CreditLedger.aggregate([
      {
        $match: {
          user_id: userId,
          status: "completed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const byType: Record<string, number> = {};
    let totalUsed = 0;
    let totalAdded = 0;
    let totalRefunded = 0;

    for (const item of byTypeResult) {
      byType[item._id] = item.total;
      
      if (item.total < 0) {
        totalUsed += Math.abs(item.total);
      } else if (item._id === "refund") {
        totalRefunded += item.total;
      } else {
        totalAdded += item.total;
      }
    }

    // Daily breakdown
    const dailyResult = await CreditLedger.aggregate([
      {
        $match: {
          user_id: userId,
          status: "completed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          used: {
            $sum: {
              $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
            },
          },
          added: {
            $sum: {
              $cond: [{ $gt: ["$amount", 0] }, "$amount", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyUsage = dailyResult.map((d) => ({
      date: d._id,
      used: d.used,
      added: d.added,
    }));

    const balance = await this.getBalance(userId);

    return {
      totalCredits: balance,
      totalUsed,
      totalAdded,
      totalRefunded,
      byType,
      dailyUsage,
    };
  }

  /**
   * Process monthly credit distribution for annual subscribers
   * 
   * Called on user access to check if credits are due
   * Returns true if credits were added
   */
  async processMonthlyCredits(userId: string): Promise<{
    processed: boolean;
    creditsAdded: number;
    nextCreditDate?: number;
  }> {
    await dbConnect();

    try {
      const user = await User.findById(userId);
      
      if (!user?.subscription) {
        return { processed: false, creditsAdded: 0 };
      }

      const { subscription } = user;

      // Only process for active annual subscriptions
      if (subscription.status !== "active" || subscription.billing_cycle !== "yearly") {
        return { processed: false, creditsAdded: 0 };
      }

      // Check if credits are due
      const now = Date.now();
      const nextCreditDate = subscription.next_credit_date;

      // If no next_credit_date set, or it's in the future, skip
      if (!nextCreditDate || nextCreditDate > now) {
        return { processed: false, creditsAdded: 0, nextCreditDate };
      }

      // Don't add credits if subscription has ended
      if (subscription.current_period_ends && subscription.current_period_ends < now) {
        return { processed: false, creditsAdded: 0 };
      }

      // Calculate monthly credits
      const priceId = subscription.price_id;
      if (!priceId) {
        return { processed: false, creditsAdded: 0 };
      }

      const monthlyCredits = getCreditsForPrice(priceId, 1);
      if (monthlyCredits <= 0) {
        return { processed: false, creditsAdded: 0 };
      }

      // Add credits
      const result = await this.addCredits({
        userId,
        amount: monthlyCredits,
        type: "subscription_renewal",
        description: `Monthly credit allocation (${getPlanNameFromPriceId(priceId)} Annual)`,
        source: "system",
        subscriptionId: subscription.id,
        priceId,
        idempotencyKey: `monthly_credit_${userId}_${nextCreditDate}`,
      });

      if (!result.success) {
        console.error(`[CreditService] Failed to add monthly credits for user ${userId}:`, result.error);
        return { processed: false, creditsAdded: 0 };
      }

      // Calculate next credit date (30 days from current due date)
      const newNextCreditDate = nextCreditDate + (30 * 24 * 60 * 60 * 1000);

      // Update subscription with new dates
      await User.findByIdAndUpdate(userId, {
        $set: {
          "subscription.last_credit_date": now,
          "subscription.next_credit_date": newNextCreditDate,
        },
      });

      console.log(`[CreditService] Added ${monthlyCredits} monthly credits for annual subscriber ${userId}. Next: ${new Date(newNextCreditDate).toISOString()}`);

      return {
        processed: true,
        creditsAdded: monthlyCredits,
        nextCreditDate: newNextCreditDate,
      };

    } catch (error) {
      console.error("[CreditService] Error processing monthly credits:", error);
      return { processed: false, creditsAdded: 0 };
    }
  }
}

// Export singleton instance
export const CreditService = CreditServiceClass.getInstance();

// Export convenience functions
export const addCredits = (input: AddCreditsInput) => CreditService.addCredits(input);
export const deductCredits = (input: DeductCreditsInput) => CreditService.deductCredits(input);
export const refundCredits = (input: RefundCreditsInput) => CreditService.refundCredits(input);
export const getBalance = (userId: string) => CreditService.getBalance(userId);
export const validateBalance = (userId: string, required: number) => CreditService.validateBalance(userId, required);
export const verifyBalance = (userId: string) => CreditService.verifyBalance(userId);
export const syncFromPaddle = (userId: string, email: string) => CreditService.syncFromPaddle(userId, email);
export const getUsageSummary = (userId: string, days?: number) => CreditService.getUsageSummary(userId, days);
export const getTransactionHistory = (
  userId: string, 
  options?: Parameters<typeof CreditService.getTransactionHistory>[1]
) => CreditService.getTransactionHistory(userId, options);
export const processMonthlyCredits = (userId: string) => CreditService.processMonthlyCredits(userId);

