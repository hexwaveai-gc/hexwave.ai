/**
 * POST /api/paddle/checkout
 * Handles checkout and subscription upgrades for Paddle Billing v2
 * 
 * Flow:
 * 1. NEW subscription: Returns checkout data for Paddle.js overlay
 * 2. UPGRADE existing subscription: Uses Paddle API to update subscription directly
 * 
 * Protected by withAuth middleware with "authenticated_free_tier" preset:
 * - Requires authentication
 * - Rate limiting: 100 req/min for paid users, 20 req/min for free tier
 * - No credit check (checkout is a read operation)
 * 
 * Additional validation:
 * - Prevents billing cycle mismatch (annual subscribers can't buy monthly plans)
 * - Prevents downgrades (must use billing portal or contact support)
 */

import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { PADDLE_CONFIG, PADDLE_PRICES, getCheckoutUrls, getPlanNameFromPriceId, isAnnualBilling, type PurchaseType } from "@/lib/paddle/config";
import { withAuth, type AuthContext } from "@/lib/api/auth-middleware";
import { logInfo, logError, logWarn } from "@/lib/logger";
import { ApiResponse } from "@/utils/api-response/response";
import User from "@/app/models/User/user.model";
import { dbConnect } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================================
// PADDLE API HELPERS
// ============================================================================

/**
 * Paddle API base URL based on environment
 */
function getPaddleApiUrl(): string {
  return PADDLE_CONFIG.environment === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

/**
 * Proration billing modes for subscription updates
 * - prorated_immediately: Charge prorated amount now
 * - prorated_next_billing_period: Apply change at next billing
 * - full_immediately: Charge full amount now
 * - full_next_billing_period: Charge full amount at next billing
 * - do_not_bill: Don't charge (for downgrades/credits)
 */
type ProrationBillingMode = 
  | "prorated_immediately" 
  | "prorated_next_billing_period" 
  | "full_immediately" 
  | "full_next_billing_period" 
  | "do_not_bill";

/**
 * Update an existing Paddle subscription
 * Uses Paddle API v2 to modify subscription items
 */
async function updatePaddleSubscription(
  subscriptionId: string,
  priceId: string,
  prorationBillingMode: ProrationBillingMode = "prorated_immediately"
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const apiUrl = `${getPaddleApiUrl()}/subscriptions/${subscriptionId}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${PADDLE_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            price_id: priceId,
            quantity: 1,
          },
        ],
        proration_billing_mode: prorationBillingMode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      logError("Paddle API error updating subscription", new Error(JSON.stringify(data)), {
        subscriptionId,
        priceId,
        status: response.status,
      });
      
      // Extract user-friendly error message
      const errorMessage = data?.error?.detail || data?.error?.message || "Failed to update subscription";
      return { success: false, error: errorMessage };
    }

    return { success: true, data };
  } catch (error) {
    logError("Network error updating Paddle subscription", error);
    return { success: false, error: "Network error while updating subscription" };
  }
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

/**
 * POST /api/paddle/checkout
 * 
 * Protected by withAuth middleware:
 * - ✅ Authentication (Clerk)
 * - ✅ Rate limiting (100 req/min for paid, 20 req/min for free tier)
 * 
 * Response types:
 * - action: "checkout" → Open Paddle.js overlay (new subscription)
 * - action: "upgraded" → Subscription updated via API (existing subscription)
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

      // Check if user has an active subscription
      await dbConnect();
      const dbUser = await User.findById(userId).select("subscription customerId").lean();
      
      // Determine purchase type for success page messaging
      let purchaseType: PurchaseType = "plan"; // Default: new plan purchase
      
      // Type the subscription for better type safety
      const currentSubscription = dbUser?.subscription as {
        id?: string;
        status?: string;
        billing_cycle?: string;
        product_id?: string;
        price_id?: string;
      } | null;

      const isActiveSubscription = currentSubscription && 
        ["active", "trialing"].includes(currentSubscription.status || "");
      const hasSubscriptionId = !!currentSubscription?.id;

      // ========================================================================
      // UPGRADE PATH: User has active subscription → Update via Paddle API
      // ========================================================================
      if (isActiveSubscription && hasSubscriptionId) {
        const subscriptionId = currentSubscription.id!;

        // Validation 1: Prevent billing cycle DOWNGRADE (annual → monthly)
        if (currentSubscription.billing_cycle) {
          const requestedIsAnnual = isAnnualBilling(priceId);
          const currentIsAnnual = currentSubscription.billing_cycle === "annual";

          if (currentIsAnnual && !requestedIsAnnual) {
            logWarn("Billing cycle downgrade attempted", {
              userId,
              currentCycle: "annual",
              requestedCycle: "monthly",
              priceId,
            });

            return ApiResponse.badRequest(
              "Cannot change from annual to monthly billing. Please contact support to change your billing cycle."
            );
          }

          // Track billing cycle upgrade
          if (!currentIsAnnual && requestedIsAnnual) {
            purchaseType = "billing_change";
            logInfo("Billing cycle upgrade: monthly to annual", { userId, priceId });
          }
        }

        // Validation 2: Prevent purchasing the same plan
        if (currentSubscription.price_id === priceId) {
          logWarn("Same plan purchase attempted", { userId, priceId });

          return ApiResponse.badRequest(
            "You already have this plan active. To manage your subscription, please visit the billing portal."
          );
        }

        // Validation 3: Prevent downgrade to lower tier
        const planHierarchy: Record<string, number> = {
          "pro": 1,
          "ultimate": 2,
          "creator": 3,
        };

        const { PRODUCT_TO_TIER, PRICE_TO_PRODUCT } = await import("@/lib/paddle/config");
        
        const currentProductId = currentSubscription.product_id;
        const requestedProductId = PRICE_TO_PRODUCT[priceId];
        
        if (currentProductId && requestedProductId) {
          const currentTier = PRODUCT_TO_TIER[currentProductId] || "pro";
          const requestedTier = PRODUCT_TO_TIER[requestedProductId] || "pro";
          
          const currentLevel = planHierarchy[currentTier] || 0;
          const requestedLevel = planHierarchy[requestedTier] || 0;

          logInfo("Plan tier comparison for upgrade", {
            userId,
            subscriptionId,
            currentTier,
            requestedTier,
            currentLevel,
            requestedLevel,
          });

          if (requestedLevel < currentLevel) {
            logWarn("Downgrade attempted via checkout", {
              userId,
              currentTier,
              requestedTier,
              priceId,
            });

            return ApiResponse.badRequest(
              "To downgrade your plan, please use the billing portal or contact support."
            );
          }
          
          if (requestedLevel > currentLevel) {
            purchaseType = "upgrade";
          }
        }

        // ====================================================================
        // UPDATE EXISTING SUBSCRIPTION via Paddle API
        // ====================================================================
        logInfo("Updating existing subscription via Paddle API", {
          userId,
          subscriptionId,
          currentPriceId: currentSubscription.price_id,
          newPriceId: priceId,
          purchaseType,
        });

        const updateResult = await updatePaddleSubscription(
          subscriptionId,
          priceId,
          "prorated_immediately" // Charge prorated difference now
        );

        if (!updateResult.success) {
          logError("Failed to update subscription", new Error(updateResult.error || "Unknown"), {
            userId,
            subscriptionId,
            priceId,
          });

          return ApiResponse.badRequest(
            updateResult.error || "Failed to update your subscription. Please try again or contact support."
          );
        }

        logInfo("Subscription updated successfully via Paddle API", {
          userId,
          subscriptionId,
          newPriceId: priceId,
          purchaseType,
        });

        // Return success - no checkout needed, subscription was updated directly
        return ApiResponse.ok({
          action: "upgraded",
          message: purchaseType === "upgrade" 
            ? "Your plan has been upgraded successfully!" 
            : "Your billing cycle has been updated successfully!",
          purchaseType,
          subscription: {
            id: subscriptionId,
            newPriceId: priceId,
            planName: getPlanNameFromPriceId(priceId),
          },
          redirectUrl: getCheckoutUrls(purchaseType).success,
        });
      }

      // ========================================================================
      // NEW SUBSCRIPTION PATH: No active subscription → Return checkout data
      // ========================================================================
      const { success } = getCheckoutUrls(purchaseType);

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

      logInfo("Generated checkout data for new subscription", {
        userId,
        planName: getPlanNameFromPriceId(priceId),
        billingCycle: billingCycle || "monthly",
        priceId,
      });

      return ApiResponse.ok({
        action: "checkout",
        checkoutData,
        clientToken: PADDLE_CONFIG.clientToken,
        environment: PADDLE_CONFIG.environment,
      });

    } catch (error) {
      logError("Error in checkout handler", error);
      return ApiResponse.serverError("Failed to process checkout request");
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

