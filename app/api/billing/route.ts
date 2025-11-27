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
    next_payment_date?: string;
    next_payment_amount?: string;
    cancel_at_period_end: boolean;
    canceled_at?: string;
    started_at?: string;
    customer_id?: string;
  } | null;
  transactions: TransactionItem[];
  customer_portal_url?: string;
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

      response.subscription = {
        id: paddleSubscription.id,
        status: paddleSubscription.status,
        plan_name: planName,
        plan_tier: user.subscription.plan_tier || "basic",
        billing_cycle: billingCycle,
        credits_per_period: creditsPerPeriod,
        current_period_start: subData.currentBillingPeriod?.startsAt || "",
        current_period_ends: subData.currentBillingPeriod?.endsAt || "",
        next_payment_date: subData.nextBilledAt,
        next_payment_amount: subData.nextTransaction?.details?.totals?.total 
          ? formatAmount(subData.nextTransaction.details.totals.total, subData.currencyCode)
          : undefined,
        cancel_at_period_end: subData.scheduledChange?.action === "cancel",
        canceled_at: subData.canceledAt,
        started_at: subData.startedAt,
        customer_id: user.customerId,
      };
    } catch (error) {
      logError("Error fetching Paddle subscription", error, { userId });
      // Use local data if Paddle fails
      if (user.subscription) {
        response.subscription = {
          id: user.subscription.id || "",
          status: user.subscription.status || "unknown",
          plan_name: user.subscription.plan_name || "Unknown",
          plan_tier: user.subscription.plan_tier || "basic",
          billing_cycle: user.subscription.billing_cycle || "monthly",
          credits_per_period: user.subscription.price_id ? PLAN_CREDITS[user.subscription.price_id] || 0 : 0,
          current_period_start: user.subscription.current_period_start 
            ? new Date(user.subscription.current_period_start).toISOString() 
            : "",
          current_period_ends: user.subscription.current_period_ends 
            ? new Date(user.subscription.current_period_ends).toISOString() 
            : "",
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
 * POST /api/billing
 * Handle billing actions (cancel, pause, resume subscription)
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
      case "cancel": {
        await paddle.subscriptions.cancel(user.subscription.id, {
          effectiveFrom: "next_billing_period",
        });

        await User.findByIdAndUpdate(userId, {
          $set: {
            "subscription.cancel_at_period_end": true,
          },
        });

        return ApiResponse.ok(
          undefined,
          "Subscription will be canceled at the end of the billing period"
        );
      }

      case "cancel_immediately": {
        await paddle.subscriptions.cancel(user.subscription.id, {
          effectiveFrom: "immediately",
        });

        await User.findByIdAndUpdate(userId, {
          $set: {
            "subscription.status": "canceled",
            "subscription.canceled_at": Date.now(),
          },
        });

        return ApiResponse.ok(undefined, "Subscription canceled immediately");
      }

      case "pause": {
        await paddle.subscriptions.pause(user.subscription.id, {});

        await User.findByIdAndUpdate(userId, {
          $set: {
            "subscription.status": "paused",
          },
        });

        return ApiResponse.ok(undefined, "Subscription paused");
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

        return ApiResponse.ok(undefined, "Subscription resumed");
      }

      case "reactivate": {
        // For subscriptions scheduled to cancel, remove the scheduled cancellation
        await paddle.subscriptions.update(user.subscription.id, {
          scheduledChange: null,
        });

        await User.findByIdAndUpdate(userId, {
          $set: {
            "subscription.cancel_at_period_end": false,
          },
        });

        return ApiResponse.ok(undefined, "Subscription reactivated");
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
    return `${planName} Plan - ${cycle === "yearly" ? "Annual" : "Monthly"} Subscription`;
  }

  return firstItem?.price?.description || "Subscription Payment";
}

function getInvoiceUrl(transactionId: string): string {
  // Paddle provides invoice PDFs via their API
  // For now, return a link to our API that will redirect to Paddle
  return `/api/billing/invoice/${transactionId}`;
}

