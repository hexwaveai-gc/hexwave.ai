import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PADDLE_CONFIG, PADDLE_PRICES, getCheckoutUrls, getPlanNameFromPriceId } from "@/lib/paddle/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/paddle/checkout
 * Returns checkout data for Paddle.js client-side checkout
 * 
 * Paddle Billing (v2) requires using Paddle.js for checkout.
 * This endpoint returns the data needed to open the checkout overlay.
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get full user details
    const user = await currentUser();
    
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    const userEmail = user.emailAddresses[0].emailAddress;

    // Parse request body
    const body = await req.json();
    const { priceId, billingCycle, quantity = 1 } = body;

    // Validate price ID
    const validPriceIds = Object.values(PADDLE_PRICES);
    if (!priceId || !validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: "Invalid price ID" },
        { status: 400 }
      );
    }

    // Get checkout URLs
    const { success } = getCheckoutUrls();

    // Return data for Paddle.js checkout
    const checkoutData = {
      items: [
        {
          priceId,
          quantity,
        },
      ],
      customer: {
        email: userEmail,
      },
      customData: {
        user_id: userId,
        billing_cycle: billingCycle || "monthly",
        plan_name: getPlanNameFromPriceId(priceId),
      },
      settings: {
        successUrl: `${success}?transaction_id={transaction_id}`,
        displayMode: "overlay" as const,
        theme: "dark" as const,
        locale: "en",
      },
    };

    console.log(`[Paddle Checkout] Generated checkout data for user ${userId}, plan: ${getPlanNameFromPriceId(priceId)}`);

    return NextResponse.json({
      success: true,
      checkoutData,
      clientToken: PADDLE_CONFIG.clientToken,
      environment: PADDLE_CONFIG.environment,
    });

  } catch (error) {
    console.error("[Paddle Checkout] Error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate checkout data",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/paddle/checkout
 * Get Paddle configuration for client-side initialization
 */
export async function GET() {
  try {
    return NextResponse.json({
      environment: PADDLE_CONFIG.environment,
      clientToken: PADDLE_CONFIG.clientToken,
    });
  } catch (error) {
    console.error("[Paddle Checkout] Error fetching config:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch checkout config" },
      { status: 500 }
    );
  }
}

