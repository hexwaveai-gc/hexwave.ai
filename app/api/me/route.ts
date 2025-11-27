/**
 * /api/me - User Profile & Balance API
 * 
 * Returns user data without sensitive fields.
 * Includes Paddle sync fallback for missing credits.
 * 
 * Protected by authMiddleware - handles auth, rate limiting automatically.
 */

import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import User, { type IUser } from "@/app/models/User/user.model";
import { CreditService } from "@/lib/services/CreditService";
import { getPaddleClient } from "@/lib/paddle/client";
import { 
  getCreditsForPrice, 
  getPlanNameFromPriceId, 
  PRODUCT_TO_TIER, 
  getBillingCycle 
} from "@/constants/paddle";
import CreditLedger from "@/app/models/CreditLedger/credit-ledger.model";
import { withAuth, type AuthContext } from "@/lib/api/auth-middleware";
import { logInfo, logError, logCredits } from "@/lib/logger";
import { ApiResponse } from "@/utils/api-response/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/me
 * 
 * Returns:
 * - credits
 * - subscription data
 * - usage summary (optional)
 * 
 * Also performs Paddle sync if needed
 * 
 * Protected by withAuth middleware with "authenticated_free_tier" preset:
 * - Requires authentication
 * - API rate limiting (100 req/min for paid, 20 req/min for free tier)
 * - No credit check (read-only)
 */
export const GET = withAuth(
  async (req: NextRequest, authContext: AuthContext) => {
    const { userId, user: authUser } = authContext;

    // Get user from database (may need fresh data for sync)
    let user = await User.findById(userId).lean<IUser>();
    
    // If user doesn't exist but auth passed, create them
    if (!user) {
      user = authUser;
    }
    
    // Get Clerk user for email (needed for Paddle sync)
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;

    // If user doesn't exist in our DB, this is a problem - they should have been created by Clerk webhook
    if (!user) {
      // Try to create user if they exist in Clerk but not in our DB
      if (clerkUser) {
        const newUser = new User({
          _id: userId,
          name: clerkUser.firstName 
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : email?.split("@")[0] || "User",
          email: email?.toLowerCase() || "",
          customerId: null,
          subscription: null,
          credits: 0, 
        });
        await newUser.save();
        user = await User.findById(userId).lean();
      } else {
        return ApiResponse.notFound("User not found");
      }
    }

    // Check if we need to sync with Paddle
    const shouldSync = await shouldSyncWithPaddle(userId, user);
    
    if (shouldSync && email) {
      logInfo("Initiating Paddle sync", { userId, operation: "paddle_sync" });
      const syncResult = await syncPaddleData(userId, email, user);
      
      if (syncResult.updated) {
        // Refresh user data after sync
        user = await User.findById(userId).lean();
      }
    }

    // Process monthly credits for annual subscribers
    if (user?.subscription?.billing_cycle === "yearly" && user.subscription.status === "active") {
      const monthlyResult = await CreditService.processMonthlyCredits(userId);
      if (monthlyResult.processed) {
        // Refresh user data after adding credits
        user = await User.findById(userId).lean();
      }
    }

    // Get usage summary for dashboard (last 30 days)
    const includeSummary = req.nextUrl.searchParams.get("summary") === "true";
    let usageSummary = null;
    
    if (includeSummary) {
      usageSummary = await CreditService.getUsageSummary(userId, 30);
    }

    // Verify balance integrity
    // const balanceVerification = await CreditService.verifyBalance(userId);
    
    // // If there's a significant discrepancy, log it (but don't fix automatically)
    // if (!balanceVerification.isValid && Math.abs(balanceVerification.discrepancy) > 1) {
    //   console.warn(`[API/me] Balance discrepancy detected for user ${userId}:`, {
    //     stored: balanceVerification.storedBalance,
    //     calculated: balanceVerification.calculatedBalance,
    //     discrepancy: balanceVerification.discrepancy,
    //   });
    // }

    // Build response (exclude sensitive fields)
    const response: Record<string, unknown> = {
      credits: user?.credits || 0,
      subscription: user?.subscription ? {
        id: user.subscription.id,
        status: user.subscription.status,
        plan_name: user.subscription.plan_name,
        plan_tier: user.subscription.plan_tier,
        billing_cycle: user.subscription.billing_cycle,
        current_period_start: user.subscription.current_period_start,
        current_period_ends: user.subscription.current_period_ends,
        cancel_at_period_end: user.subscription.cancel_at_period_end,
        next_payment_date: user.subscription.next_payment_date,
        // Annual plan credit tracking
        next_credit_date: user.subscription.next_credit_date,
      } : null,
    };

    if (usageSummary) {
      response.usage_summary = usageSummary;
    }

    return ApiResponse.ok(response);
  },
  "authenticated_free_tier" // 100 req/min for paid users, 20 req/min for free tier
);

/**
 * Check if we should sync with Paddle
 */
async function shouldSyncWithPaddle(userId: string, user: IUser | null): Promise<boolean> {
  // Sync if:
  // 1. User has a subscription but no credits ever added (might have missed webhook)
  // 2. Last verification was more than 1 hour ago
  // 3. User has Paddle customer ID but no active subscription record
  
  if (!user) return false;
  
  // If user has subscription but balance is 0 and no transactions
  if (user.subscription?.status === "active" && user.credits === 0) {
    const hasTransactions = await CreditLedger.exists({ user_id: userId });
    if (!hasTransactions) {
      return true;
    }
  }

  // If last verification was more than 1 hour ago
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (!user.balance_verified_at || new Date(user.balance_verified_at) < oneHourAgo) {
    // Only sync if user has a Paddle customer ID (meaning they've interacted with Paddle)
    if (user.customerId) {
      return true;
    }
  }

  return false;
}

/**
 * Sync user data with Paddle
 */
async function syncPaddleData(
  userId: string,
  email: string,
  user: IUser | null
): Promise<{ updated: boolean; creditsAdded: number }> {
  try {
    const paddle = getPaddleClient();
    
    // If user has no customer ID, try to find by email
    let customerId = user?.customerId;
    
    if (!customerId) {
      // Search for customer by email
      const customers = await paddle.customers.list({
        email: [email],
      });
      
      for await (const customer of customers) {
        customerId = customer.id;
        // Update user with customer ID
        await User.findByIdAndUpdate(userId, { customerId });
        break;
      }
    }

    if (!customerId) {
      // No Paddle customer found
      return { updated: false, creditsAdded: 0 };
    }

    // Get active subscriptions
    const subscriptions = await paddle.subscriptions.list({
      customerId: [customerId],
      status: ["active", "trialing"],
    });

    let totalCreditsAdded = 0;
    let subscriptionUpdated = false;

    for await (const subscription of subscriptions) {
      // Update subscription data if not present or different
      // Paddle SDK doesn't export full type, cast to access additional properties
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subData = subscription as any;
      
      if (!user?.subscription?.id || user.subscription.id !== subscription.id) {
        // Get price info from items
        const firstItem = subscription.items?.[0];
        const priceId = firstItem?.price?.id;
        const productId = firstItem?.price?.productId;

        const subscriptionUpdate = {
          id: subscription.id,
          customerId: customerId,
          product_id: productId,
          price_id: priceId,
          status: subscription.status,
          current_period_start: subData.currentBillingPeriod?.startsAt 
            ? new Date(subData.currentBillingPeriod.startsAt).getTime() 
            : undefined,
          current_period_ends: subData.currentBillingPeriod?.endsAt 
            ? new Date(subData.currentBillingPeriod.endsAt).getTime() 
            : undefined,
          billing_cycle: priceId ? getBillingCycle(priceId) : undefined,
          plan_tier: productId ? PRODUCT_TO_TIER[productId] : undefined,
          plan_name: priceId ? getPlanNameFromPriceId(priceId) : undefined,
          started_at: subData.startedAt ? new Date(subData.startedAt).getTime() : undefined,
          cancel_at_period_end: subData.scheduledChange?.action === "cancel",
          next_payment_date: subData.nextBilledAt 
            ? new Date(subData.nextBilledAt).getTime() 
            : undefined,
        };

        await User.findByIdAndUpdate(userId, { 
          subscription: subscriptionUpdate,
          customerId,
        });
        subscriptionUpdated = true;
      }

      // Check for missing transaction credits
      const transactionId = subData.firstTransactionId;
      
      if (transactionId) {
        // Check if transaction already processed in CreditLedger
        const existsInLedger = await CreditLedger.exists({
          transaction_id: transactionId,
        });

        if (!existsInLedger) {
          // Get transaction details and add credits
          try {
            const transaction = await paddle.transactions.get(transactionId);
            
            let credits = 0;
            for (const item of transaction.items || []) {
              const itemPriceId = item.price?.id;
              if (itemPriceId) {
                credits += getCreditsForPrice(itemPriceId, item.quantity || 1);
              }
            }

            if (credits > 0) {
              const result = await CreditService.addCredits({
                userId,
                amount: credits,
                type: "sync_adjustment",
                description: `Paddle sync: ${getPlanNameFromPriceId(transaction.items?.[0]?.price?.id || "")} subscription`,
                source: "sync",
                transactionId: transactionId,
                subscriptionId: subscription.id,
                customerId: customerId,
                priceId: transaction.items?.[0]?.price?.id,
                metadata: { 
                  sync_reason: "api_me_fallback",
                  original_status: transaction.status,
                },
              });

              if (result.success) {
                totalCreditsAdded += credits;
                logCredits("add", credits, {
                  userId,
                  transactionId,
                  source: "paddle_sync",
                  operation: "api_me_fallback",
                });
              }
            }
          } catch (txError) {
            logError("Error fetching transaction during Paddle sync", txError, {
              userId,
              transactionId,
              operation: "paddle_sync",
            });
          }
        }
      }
    }

    // Update balance verification timestamp
    await User.findByIdAndUpdate(userId, {
      balance_verified_at: new Date(),
    });

    return {
      updated: subscriptionUpdated || totalCreditsAdded > 0,
      creditsAdded: totalCreditsAdded,
    };

  } catch (error) {
    logError("Error syncing with Paddle", error, {
      userId,
      operation: "paddle_sync",
    });
    return { updated: false, creditsAdded: 0 };
  }
}

