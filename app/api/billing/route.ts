/**
 * /api/billing - Billing & Subscription API
 * 
 * Returns subscription details, invoices, and manages subscription actions.
 */

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import User from "@/app/models/User/user.model";
import { getPaddleClient } from "@/lib/paddle/client";
import { 
  getPlanNameFromPriceId, 
  getBillingCycle,
  PLAN_CREDITS,
} from "@/constants/paddle";
import { ApiResponse } from "@/utils/api-response/response";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TransactionItem {
  id: string;
  date: string;
  amount: string;
  currency: string;
  status: string;
  description: string;
  invoice_url?: string;
}

interface PaymentMethod {
  type: string;
  last_four?: string;
  expiry_month?: number;
  expiry_year?: number;
  card_brand?: string;
}

interface BillingResponse {
  subscription: {
    id: string;
    status: string;
    plan_name: string;
    plan_tier: string;
    billing_cycle: string;
    credits_per_period: number;
    current_period_start: string;
    current_period_ends: string;
    next_credit_date?: string;
    cancel_at_period_end: boolean;
    canceled_at?: string;
    started_at?: string;
    customer_id?: string;
    // Enhanced billing info
    next_billing_amount?: string;
    next_billing_date?: string;
    currency?: string;
    unit_price?: string;
    trial_ends_at?: string;
    is_trialing?: boolean;
    payment_method?: PaymentMethod;
  } | null;
  transactions: TransactionItem[];
  customer_portal_url?: string;
}

/**
 * Calculate next monthly credit assignment date
 * 
 * Handles all edge cases:
 * - Day overflow (31st → 28th in Feb, 30th in Apr/Jun/Sep/Nov)
 * - Leap years (Feb 29 in leap years)
 * - Year rollover (Dec → Jan next year)
 * 
 * @param lastCreditDate - Timestamp of last credit assignment (ms)
 * @param startedAt - Timestamp of subscription start (ms) - used for original day
 * @returns ISO string of next credit date
 */
function calculateNextCreditDate(lastCreditDate: number, startedAt: number): string {
  const lastDate = new Date(lastCreditDate);
  const originalDate = new Date(startedAt);
  const originalDay = originalDate.getUTCDate();
  
  // Get next month
  let nextMonth = lastDate.getUTCMonth() + 1;
  let nextYear = lastDate.getUTCFullYear();
  
  // Handle year rollover
  if (nextMonth > 11) {
    nextMonth = 0;
    nextYear += 1;
  }
  
  // Get the last day of the next month
  const lastDayOfNextMonth = new Date(Date.UTC(nextYear, nextMonth + 1, 0)).getUTCDate();
  
  // Use the original day, but cap at the last day of the month
  const creditDay = Math.min(originalDay, lastDayOfNextMonth);
  
  // Preserve the original time (hour, minute, second)
  const nextCreditDate = new Date(Date.UTC(
    nextYear,
    nextMonth,
    creditDay,
    originalDate.getUTCHours(),
    originalDate.getUTCMinutes(),
    originalDate.getUTCSeconds(),
    originalDate.getUTCMilliseconds()
  ));
  
  return nextCreditDate.toISOString();
}

/**
 * Get next credit date based on billing cycle
 * 
 * - Monthly plans: next credit date = current_period_ends (renewal)
 * - Annual plans: next credit date from DB or calculated monthly cycle
 */
function getNextCreditDate(
  billingCycle: string,
  currentPeriodEnds: string,
  dbNextCreditDate?: number,
  lastCreditDate?: number,
  startedAt?: number
): string | undefined {
  // For monthly plans, credits come on renewal
  if (billingCycle === "monthly") {
    return currentPeriodEnds;
  }
  
  // For annual plans, use stored date or calculate
  if (billingCycle === "annual" || billingCycle === "yearly") {
    // If we have the next credit date stored in DB, use it
    if (dbNextCreditDate) {
      return new Date(dbNextCreditDate).toISOString();
    }
    
    // Calculate from last credit date if available
    if (lastCreditDate && startedAt) {
      return calculateNextCreditDate(lastCreditDate, startedAt);
    }
    
    // Fallback: if no credit dates, use period end
    return currentPeriodEnds;
  }
  
  // For other billing cycles, return undefined
  return undefined;
}

/**
 * GET /api/billing
 * Get billing details including subscription and transactions
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized();
    }

    await dbConnect();

    const user = await User.findById(userId).lean();
    if (!user) {
      return ApiResponse.notFound("User not found");
    }

    const response: BillingResponse = {
      subscription: null,
      transactions: [],
    };

    // If no subscription, return empty billing
    if (!user.subscription?.id || !user.customerId) {
      return ApiResponse.ok(response);
    }

    const paddle = getPaddleClient();

    // Get subscription details from Paddle
    try {
      const paddleSubscription = await paddle.subscriptions.get(user.subscription.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subData = paddleSubscription as any;

      const priceId = subData.items?.[0]?.price?.id;
      const planName = priceId ? getPlanNameFromPriceId(priceId) : user.subscription.plan_name || "Unknown";
      const billingCycle = priceId ? getBillingCycle(priceId) : user.subscription.billing_cycle || "monthly";
      const creditsPerPeriod = priceId ? PLAN_CREDITS[priceId] || 0 : 0;

      const currentPeriodEnds = subData.currentBillingPeriod?.endsAt || "";
      const currencyCode = subData.currencyCode || "USD";
      
      // Get pricing info from the subscription item
      const subscriptionItem = subData.items?.[0];
      const unitPrice = subscriptionItem?.price?.unitPrice?.amount;
      const nextBillingAmount = subData.nextBilledAt && !subData.scheduledChange?.action 
        ? formatAmount(subscriptionItem?.recurring?.totals?.total || unitPrice || "0", currencyCode)
        : undefined;
      
      // Check if trialing
      const isTrialing = paddleSubscription.status === "trialing";
      const trialEndsAt = isTrialing ? subData.currentBillingPeriod?.endsAt : undefined;
      
      // Extract payment method info if available
      let paymentMethod: PaymentMethod | undefined;
      if (subData.paymentMethod) {
        const pm = subData.paymentMethod;
        paymentMethod = {
          type: pm.type || "card",
          last_four: pm.card?.last4,
          expiry_month: pm.card?.expiryMonth,
          expiry_year: pm.card?.expiryYear,
          card_brand: pm.card?.type,
        };
      }
      
      response.subscription = {
        id: paddleSubscription.id,
        status: paddleSubscription.status,
        plan_name: planName,
        plan_tier: user.subscription.plan_tier || "basic",
        billing_cycle: billingCycle,
        credits_per_period: creditsPerPeriod,
        current_period_start: subData.currentBillingPeriod?.startsAt || "",
        current_period_ends: currentPeriodEnds,
        next_credit_date: getNextCreditDate(
          billingCycle,
          currentPeriodEnds,
          user.subscription.next_credit_date,
          user.subscription.last_credit_date,
          user.subscription.started_at
        ),
        cancel_at_period_end: subData.scheduledChange?.action === "cancel",
        canceled_at: subData.canceledAt,
        started_at: subData.startedAt,
        customer_id: user.customerId,
        // Enhanced billing info
        next_billing_amount: nextBillingAmount,
        next_billing_date: subData.scheduledChange?.action !== "cancel" ? currentPeriodEnds : undefined,
        currency: currencyCode,
        unit_price: unitPrice ? formatAmount(unitPrice, currencyCode) : undefined,
        trial_ends_at: trialEndsAt,
        is_trialing: isTrialing,
        payment_method: paymentMethod,
      };
    } catch (error) {
      logError("Error fetching Paddle subscription", error, { userId });
      // Use local data if Paddle fails
      if (user.subscription) {
        const localBillingCycle = user.subscription.billing_cycle || "monthly";
        const localPeriodEnds = user.subscription.current_period_ends 
          ? new Date(user.subscription.current_period_ends).toISOString() 
          : "";
        
        response.subscription = {
          id: user.subscription.id || "",
          status: user.subscription.status || "unknown",
          plan_name: user.subscription.plan_name || "Unknown",
          plan_tier: user.subscription.plan_tier || "basic",
          billing_cycle: localBillingCycle,
          credits_per_period: user.subscription.price_id ? PLAN_CREDITS[user.subscription.price_id] || 0 : 0,
          current_period_start: user.subscription.current_period_start 
            ? new Date(user.subscription.current_period_start).toISOString() 
            : "",
          current_period_ends: localPeriodEnds,
          next_credit_date: getNextCreditDate(
            localBillingCycle,
            localPeriodEnds,
            user.subscription.next_credit_date,
            user.subscription.last_credit_date,
            user.subscription.started_at
          ),
          cancel_at_period_end: user.subscription.cancel_at_period_end || false,
          customer_id: user.customerId || undefined,
        };
      }
    }

    // Get transactions/invoices
    try {
      const transactions = await paddle.transactions.list({
        customerId: [user.customerId],
        status: ["completed", "billed"],
      });

      const txList: TransactionItem[] = [];
      
      for await (const tx of transactions) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const txData = tx as any;
        
        txList.push({
          id: tx.id,
          date: txData.billedAt || txData.createdAt || "",
          amount: formatAmount(txData.details?.totals?.total || "0", txData.currencyCode || "USD"),
          currency: txData.currencyCode || "USD",
          status: tx.status,
          description: getTransactionDescription(txData),
          invoice_url: txData.invoiceNumber ? getInvoiceUrl(tx.id) : undefined,
        });
      }

      response.transactions = txList.slice(0, 20); // Limit to last 20
    } catch (error) {
      logError("Error fetching transactions", error, { userId });
    }

    // Generate customer portal URL (Paddle Retain/Customer Portal)
    if (user.customerId) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      response.customer_portal_url = `${baseUrl}/api/billing/portal`;
    }

    return ApiResponse.ok(response);

  } catch (error) {
    logError("Billing API error", error);
    return ApiResponse.serverError();
  }
}

/**
 * Calculate remaining monthly credit assignments for annual plans
 * 
 * @param currentPeriodEnds - End of billing period timestamp (ms)
 * @param billingCycle - "monthly" | "annual" | "yearly"
 * @returns Number of remaining monthly credit assignments
 */
function calculateRemainingCreditAssignments(
  currentPeriodEnds: number | undefined,
  billingCycle: string | undefined
): number {
  if (!currentPeriodEnds) return 0;
  if (billingCycle !== "annual" && billingCycle !== "yearly") return 0;
  
  const endDate = new Date(currentPeriodEnds);
  const now = new Date();
  const monthsRemaining = Math.ceil(
    (endDate.getTime() - now.getTime()) / (30 * 24 * 60 * 60 * 1000)
  );
  return Math.max(0, monthsRemaining);
}

/**
 * POST /api/billing
 * Handle billing actions (cancel, pause, resume subscription)
 * 
 * CANCELLATION POLICY:
 * - Subscriptions are canceled at the END of the billing period (next_billing_period)
 * - NO prorated refunds are issued
 * - For annual plans: User continues receiving monthly credits until period ends
 * - For monthly plans: User has access until period ends
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized();
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user?.subscription?.id) {
      return ApiResponse.badRequest("No active subscription");
    }

    const body = await req.json();
    const { action } = body;

    const paddle = getPaddleClient();

    switch (action) {
      /**
       * CANCEL SUBSCRIPTION
       * 
       * Behavior:
       * - effectiveFrom: "next_billing_period" means NO immediate cancellation
       * - NO prorated refunds are issued
       * - Subscription remains ACTIVE until the billing period ends
       * - For ANNUAL plans: User continues receiving monthly credit assignments
       * - Access and features continue until current_period_ends date
       */
      case "cancel": {
        // Cancel at end of billing period - NO refund
        await paddle.subscriptions.cancel(user.subscription.id, {
          effectiveFrom: "next_billing_period",
        });

        // Update local database
        await User.findByIdAndUpdate(userId, {
          $set: {
            "subscription.cancel_at_period_end": true,
            "subscription.cancel_reason": "user_requested",
          },
        });

        // Calculate remaining benefits for the response
        const billingCycle = user.subscription.billing_cycle;
        const currentPeriodEnds = user.subscription.current_period_ends;
        const creditsPerMonth = user.subscription.price_id 
          ? PLAN_CREDITS[user.subscription.price_id] || 0 
          : 0;
        
        const remainingCreditAssignments = calculateRemainingCreditAssignments(
          currentPeriodEnds,
          billingCycle
        );
        
        const isAnnual = billingCycle === "annual" || billingCycle === "yearly";

        return ApiResponse.ok(
          {
            cancel_at_period_end: true,
            current_period_ends: currentPeriodEnds 
              ? new Date(currentPeriodEnds).toISOString() 
              : null,
            billing_cycle: billingCycle,
            // For annual plans: remaining monthly credit assignments
            remaining_credit_assignments: isAnnual ? remainingCreditAssignments : 0,
            remaining_credits: isAnnual ? remainingCreditAssignments * creditsPerMonth : 0,
            // Explicitly state no refund
            refund_amount: 0,
            refund_issued: false,
          },
          "Subscription will be canceled at the end of the billing period. No refund will be issued. " +
          (isAnnual && remainingCreditAssignments > 0
            ? `You will continue to receive ${remainingCreditAssignments} more monthly credit assignments.`
            : "You will retain access until the period ends.")
        );
      }

      /**
       * CANCEL IMMEDIATELY (Admin/Special cases only)
       * 
       * WARNING: This triggers immediate cancellation
       * - May trigger prorated refunds depending on Paddle settings
       * - Should only be used for special cases (disputes, fraud, etc.)
       */
      case "cancel_immediately": {
        await paddle.subscriptions.cancel(user.subscription.id, {
          effectiveFrom: "immediately",
        });

        await User.findByIdAndUpdate(userId, {
          $set: {
            "subscription.status": "canceled",
            "subscription.canceled_at": Date.now(),
            "subscription.cancel_reason": "user_requested",
          },
        });

        return ApiResponse.ok(
          {
            status: "canceled",
            canceled_at: new Date().toISOString(),
          },
          "Subscription canceled immediately"
        );
      }

      case "pause": {
        await paddle.subscriptions.pause(user.subscription.id, {});

        await User.findByIdAndUpdate(userId, {
          $set: {
            "subscription.status": "paused",
          },
        });

        return ApiResponse.ok(
          { status: "paused" },
          "Subscription paused"
        );
      }

      case "resume": {
        await paddle.subscriptions.resume(user.subscription.id, {
          effectiveFrom: "immediately",
        });

        await User.findByIdAndUpdate(userId, {
          $set: {
            "subscription.status": "active",
          },
        });

        return ApiResponse.ok(
          { status: "active" },
          "Subscription resumed"
        );
      }

      case "reactivate": {
        // For subscriptions scheduled to cancel, remove the scheduled cancellation
        await paddle.subscriptions.update(user.subscription.id, {
          scheduledChange: null,
        });

        await User.findByIdAndUpdate(userId, {
          $set: {
            "subscription.cancel_at_period_end": false,
            "subscription.cancel_reason": null,
          },
        });

        return ApiResponse.ok(
          { cancel_at_period_end: false },
          "Subscription reactivated. You will continue to be billed."
        );
      }

      default:
        return ApiResponse.badRequest("Invalid action");
    }

  } catch (error) {
    logError("Billing POST error", error);
    return ApiResponse.serverError("Failed to process request");
  }
}

// Helper functions

function formatAmount(amount: string | number, currency: string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  // Paddle amounts are in smallest unit (cents), convert to dollars
  const dollars = numAmount / 100;
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(dollars);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTransactionDescription(tx: any): string {
  const items = tx.items || [];
  if (items.length === 0) return "Payment";

  const firstItem = items[0];
  const priceId = firstItem?.price?.id;
  
  if (priceId) {
    const planName = getPlanNameFromPriceId(priceId);
    const cycle = getBillingCycle(priceId);
    return `${planName} Plan - ${cycle === "annual" ? "Annual" : "Monthly"} Subscription`;
  }

  return firstItem?.price?.description || "Subscription Payment";
}

function getInvoiceUrl(transactionId: string): string {
  // Paddle provides invoice PDFs via their API
  // For now, return a link to our API that will redirect to Paddle
  return `/api/billing/invoice/${transactionId}`;
}

