/**
 * /api/billing/portal - Paddle Customer Portal Redirect
 * 
 * Generates a URL to update payment method via Paddle checkout overlay.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import User from "@/app/models/User/user.model";
import { getPaddleClient } from "@/lib/paddle/client";

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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user?.subscription?.id) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 400 }
      );
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
        return NextResponse.json({
          success: true,
          url: subData.checkout.url,
          type: "checkout",
        });
      }

      // Fallback: Return subscription management info
      return NextResponse.json({
        success: true,
        subscription_id: user.subscription.id,
        customer_id: user.customerId,
        type: "info",
        message: "Use the Paddle overlay to manage your subscription",
      });

    } catch (error) {
      console.error("[Portal] Error getting payment method change transaction:", error);
      
      // Return subscription info for manual management
      return NextResponse.json({
        success: false,
        error: "Could not generate portal URL",
        subscription_id: user.subscription.id,
      });
    }

  } catch (error) {
    console.error("[Portal] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

