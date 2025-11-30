/**
 * /api/billing/portal - Paddle Payment Method Update
 * 
 * Creates a transaction for updating payment method via Paddle.js overlay.
 */

import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import User from "@/app/models/User/user.model";
import { getPaddleClient } from "@/lib/paddle/client";
import { ApiResponse } from "@/utils/api-response/response";
import { logError, logInfo } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/billing/portal
 * Get transaction ID for payment method update via Paddle.js overlay
 */
export async function GET() {
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

    const paddle = getPaddleClient();

    try {
      // Get subscription with update payment method transaction
      const transaction = await paddle.subscriptions.getPaymentMethodChangeTransaction(
        user.subscription.id
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txnData = transaction as any;
      
      logInfo("Payment method change transaction created", {
        userId,
        subscriptionId: user.subscription.id,
        transactionId: txnData.id,
      });

      // Return transaction ID for Paddle.js overlay
      return ApiResponse.ok({
        transactionId: txnData.id,
        type: "paddle_overlay",
      });

    } catch (error) {
      logError("Error getting payment method change transaction", error, { userId });
      
      return ApiResponse.error(
        "PORTAL_ERROR",
        "Could not create payment method update session",
        400,
        { subscription_id: user.subscription.id }
      );
    }

  } catch (error) {
    logError("Portal API error", error);
    return ApiResponse.serverError();
  }
}

