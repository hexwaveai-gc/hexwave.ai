/**
 * POST /api/paddle/checkout
 * Returns checkout data for Paddle.js client-side checkout
 * 
 * Paddle Billing (v2) requires using Paddle.js for checkout.
 * This endpoint returns the data needed to open the checkout overlay.
 * 
 * Protected by withAuth middleware with "authenticated_free_tier" preset:
 * - Requires authentication
 * - Rate limiting: 100 req/min for paid users, 20 req/min for free tier
 * - No credit check (checkout is a read operation)
 */

import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { PADDLE_CONFIG, PADDLE_PRICES, getCheckoutUrls, getPlanNameFromPriceId } from "@/lib/paddle/config";
import { withAuth, type AuthContext } from "@/lib/api/auth-middleware";
import { logInfo, logError } from "@/lib/logger";
import { ApiResponse } from "@/utils/api-response/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/paddle/checkout
 * 
 * Protected by withAuth middleware:
 * - ✅ Authentication (Clerk)
 * - ✅ Rate limiting (100 req/min for paid, 20 req/min for free tier)
 */
export const POST = withAuth(
  async (req: NextRequest, authContext: AuthContext) => {
    const { userId } = authContext;

    try {
      // Get full user details from Clerk
      const user = await currentUser();
      
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        return ApiResponse.badRequest("User email not found");
      }

      const userEmail = user.emailAddresses[0].emailAddress;

      // Parse request body
      const body = await req.json();
      const { priceId, billingCycle, quantity = 1 } = body;

      // Validate price ID
      const validPriceIds = Object.values(PADDLE_PRICES);
      if (!priceId || !validPriceIds.includes(priceId)) {
        return ApiResponse.badRequest("Invalid price ID");
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
          successUrl: success,
          displayMode: "overlay" as const,
          theme: "dark" as const,
          locale: "en",
        },
      };

      logInfo("Generated checkout data", {
        planName: getPlanNameFromPriceId(priceId),
        billingCycle: billingCycle || "monthly",
        priceId,
      });

      return ApiResponse.ok({
        checkoutData,
        clientToken: PADDLE_CONFIG.clientToken,
        environment: PADDLE_CONFIG.environment,
      });

    } catch (error) {
      logError("Error generating checkout data", error);
      return ApiResponse.serverError("Failed to generate checkout data");
    }
  },
  "authenticated_free_tier" // 100 req/min for paid users, 20 req/min for free tier
);

/**
 * GET /api/paddle/checkout
 * Get Paddle configuration for client-side initialization
 * 
 * Protected by withAuth middleware:
 * - ✅ Authentication (Clerk)
 * - ✅ Rate limiting (100 req/min for paid, 20 req/min for free tier)
 */
export const GET = withAuth(
  async () => {
    try {
      return ApiResponse.ok({
        environment: PADDLE_CONFIG.environment,
        clientToken: PADDLE_CONFIG.clientToken,
      });
    } catch (error) {
      logError("Error fetching checkout config", error);
      return ApiResponse.serverError("Failed to fetch checkout config");
    }
  },
  "authenticated_free_tier" // 100 req/min for paid users, 20 req/min for free tier
);

