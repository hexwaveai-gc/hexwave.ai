/**
 * /api/billing/portal - Paddle Customer Portal Redirect
 * 
 * Generates a URL to update payment method via Paddle checkout overlay.
 */

import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import User from "@/app/models/User/user.model";
import { getPaddleClient } from "@/lib/paddle/client";
import { ApiResponse } from "@/utils/api-response/response";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/billing/portal
 * Get customer portal / update payment method URL
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
      const subscription = await paddle.subscriptions.getPaymentMethodChangeTransaction(
        user.subscription.id
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subData = subscription as any;

      if (subData.checkout?.url) {
        return ApiResponse.ok({
          url: subData.checkout.url,
          type: "checkout",
        });
      }

      // Fallback: Return subscription management info
      return ApiResponse.ok({
        subscription_id: user.subscription.id,
        customer_id: user.customerId,
        type: "info",
        message: "Use the Paddle overlay to manage your subscription",
      });

    } catch (error) {
      logError("Error getting payment method change transaction", error, { userId });
      
      // Return subscription info for manual management
      return ApiResponse.error(
        "PORTAL_ERROR",
        "Could not generate portal URL",
        400,
        { subscription_id: user.subscription.id }
      );
    }

  } catch (error) {
    logError("Portal API error", error);
    return ApiResponse.serverError();
  }
}

