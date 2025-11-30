/**
 * Paddle Webhook Event Handlers
 * Production-grade handlers for all Paddle subscription lifecycle events
 * 
 * CREDIT ALLOCATION RULES:
 * 1. NEW subscription: Full credits for the plan
 * 2. TIER UPGRADE (Pro → Ultimate): Full credit difference only
 *    - Example: Pro(4k) → Ultimate(8k) = +4k credits (tops up to new plan level)
 *    - Paddle charges prorated price, we give full credit difference
 * 3. TIER DOWNGRADE: No credits (handled via support)
 * 4. RENEWAL: Full credits for the plan
 * 5. BILLING CYCLE UPGRADE (monthly → annual): NO credits (same tier, just billing commitment)
 * 6. BILLING CYCLE DOWNGRADE (annual → monthly): Blocked at checkout (requires support)
 * 7. REFUND/CHARGEBACK: Deduct credits
 * 
 * WEBHOOK RACE CONDITION HANDLING:
 * Paddle sends subscription.created and transaction.completed webhooks close together.
 * subscription.created may update the DB BEFORE transaction.completed can analyze what changed.
 * 
 * Solution: subscription.created preserves previous subscription info (previous_product_id, 
 * previous_price_id, previous_billing_cycle) so transaction.completed can correctly detect
 * the type of change and allocate credits appropriately.
 */

import User from "@/app/models/User/user.model";
import { dbConnect } from "@/lib/db";
import { 
  getCreditsForPrice, 
  getPlanNameFromPriceId, 
  getBillingCycle,
  PRODUCT_TO_TIER,
  PADDLE_STATUS_MAP,
  MONTHLY_CREDITS,
} from "./config";
import { CreditService } from "@/lib/services/CreditService";
import { logInfo, logWarn, logError } from "@/lib/logger";

// Type definitions for Paddle webhook payloads
interface PaddleCustomData {
  user_id?: string;
  billing_cycle?: string;
  plan_name?: string;
}

interface PaddleSubscriptionItem {
  price: {
    id: string;
    product_id: string;
  };
  quantity: number;
}

interface PaddleSubscriptionEvent {
  id: string;
  status: string;
  customer_id: string;
  current_billing_period?: {
    starts_at: string;
    ends_at: string;
  };
  next_billed_at?: string;
  started_at?: string;
  canceled_at?: string;
  scheduled_change?: {
    action: string;
    effective_at: string;
  } | null;
  items: PaddleSubscriptionItem[];
  custom_data?: PaddleCustomData | string;
}

interface PaddleTransactionEvent {
  id: string;
  status: string;
  customer_id: string;
  subscription_id?: string;
  origin: string;
  items: Array<{
    price: {
      id: string;
      product_id: string;
    };
    quantity: number;
  }>;
  details?: {
    totals?: {
      total: string;
    };
  };
  custom_data?: PaddleCustomData | string;
  billed_at?: string;
}

/**
 * Parse custom_data from Paddle (handles string or object)
 */
function parseCustomData(customData: PaddleCustomData | string | undefined): PaddleCustomData | undefined {
  if (!customData) return undefined;
  
  if (typeof customData === 'string') {
    try {
      return JSON.parse(customData);
    } catch {
      return undefined;
    }
  }
  
  return customData;
}

// ============================================================================
// CREDIT CALCULATION HELPERS
// ============================================================================

/**
 * Plan tier hierarchy for upgrade/downgrade detection
 * Higher number = higher tier
 * Tiers match plan IDs: pro, ultimate, creator
 */
const PLAN_TIER_HIERARCHY: Record<string, number> = {
  "free": 0,
  "pro": 1,
  "ultimate": 2,
  "creator": 3,
};

/**
 * Determine if this is a new subscription, upgrade, downgrade, renewal, or billing cycle change
 */
type TransactionType = "new_subscription" | "upgrade" | "downgrade" | "renewal" | "billing_cycle_change" | "addon";

interface TransactionAnalysis {
  type: TransactionType;
  previousTier: string | null;
  newTier: string;
  previousCreditsPerMonth: number;
  newCreditsPerMonth: number;
  creditsToAdd: number;
  reason: string;
}

/**
 * Extended subscription info that includes previous state markers
 */
interface ExistingSubscriptionInfo {
  product_id?: string;
  price_id?: string;
  billing_cycle?: string;
  current_period_start?: number;
  current_period_ends?: number;
  status?: string;
  // Previous state markers (set by subscription.updated webhook)
  previous_product_id?: string;
  previous_price_id?: string;
  previous_billing_cycle?: string;
}

/**
 * Analyze a transaction to determine what type it is and how many credits to add
 * 
 * CREDIT RULES:
 * - subscription_recurring (renewal): Full credits for the plan
 * - subscription_update (upgrade/billing change): Depends on what changed
 *   - Billing cycle change (monthly→annual): 0 credits (already received monthly credits)
 *   - Tier upgrade (Pro→Ultimate): Credit DIFFERENCE only (e.g., 8k - 4k = 4k)
 *   - Tier downgrade: 0 credits (user already has more)
 * - New subscription: Full credits
 */
function analyzeTransaction(
  origin: string,
  newProductId: string,
  newPriceId: string,
  existingSubscription: ExistingSubscriptionInfo | null
): TransactionAnalysis {
  const newTier = PRODUCT_TO_TIER[newProductId] || "pro";
  const newCredits = getCreditsForPrice(newPriceId, 1);
  const newMonthlyCredits = MONTHLY_CREDITS[newProductId] || newCredits;
  const newBillingCycle = getBillingCycle(newPriceId);
  
  // ============================================================================
  // CASE 1: Subscription recurring payment (monthly/annual renewal)
  // ============================================================================
  if (origin === "subscription_recurring") {
    return {
      type: "renewal",
      previousTier: newTier,
      newTier,
      previousCreditsPerMonth: newMonthlyCredits,
      newCreditsPerMonth: newMonthlyCredits,
      creditsToAdd: newCredits,
      reason: "Subscription renewal - full credits allocated",
    };
  }

  // ============================================================================
  // CASE 2: Subscription update (upgrade, billing cycle change, etc.)
  // This is triggered by our API calling Paddle to update the subscription
  // ============================================================================
  if (origin === "subscription_update") {
    // Check if we have previous state markers (set by subscription.updated webhook)
    const hasPreviousMarkers = !!existingSubscription?.previous_product_id || 
                                !!existingSubscription?.previous_price_id;
    
    // Determine previous state - prefer markers, fallback to current (may be stale)
    const previousProductId = hasPreviousMarkers 
      ? existingSubscription?.previous_product_id 
      : existingSubscription?.product_id;
    const previousPriceId = hasPreviousMarkers 
      ? existingSubscription?.previous_price_id 
      : existingSubscription?.price_id;
    const previousBillingCycle = hasPreviousMarkers
      ? existingSubscription?.previous_billing_cycle
      : existingSubscription?.billing_cycle;
    
    // If no previous state at all, treat as edge case
    if (!previousProductId) {
      return {
        type: "new_subscription",
        previousTier: null,
        newTier,
        previousCreditsPerMonth: 0,
        newCreditsPerMonth: newMonthlyCredits,
        creditsToAdd: newCredits,
        reason: "Subscription update with no previous state - treating as new",
      };
    }

    const previousTier = PRODUCT_TO_TIER[previousProductId] || "pro";
    const previousMonthlyCredits = MONTHLY_CREDITS[previousProductId] || 0;
    const previousTierLevel = PLAN_TIER_HIERARCHY[previousTier] || 0;
    const newTierLevel = PLAN_TIER_HIERARCHY[newTier] || 0;

    // CASE 2a: Same product, different price = BILLING CYCLE CHANGE
    // Monthly → Annual or Annual → Monthly (same tier)
    if (previousProductId === newProductId) {
      // Even if price_id looks the same (due to race condition), 
      // subscription_update origin tells us something changed
      const detectedBillingChange = previousBillingCycle !== newBillingCycle ||
                                     previousPriceId !== newPriceId;
      
      if (detectedBillingChange) {
        return {
          type: "billing_cycle_change",
          previousTier,
          newTier,
          previousCreditsPerMonth: previousMonthlyCredits,
          newCreditsPerMonth: newMonthlyCredits,
          creditsToAdd: 0, // NO CREDITS for billing cycle changes
          reason: `Billing cycle change (${previousBillingCycle || 'unknown'} → ${newBillingCycle}) - no additional credits`,
        };
      }
      
      // Same product, same billing cycle via subscription_update = edge case
      // This shouldn't normally happen, but handle gracefully with 0 credits
      return {
        type: "billing_cycle_change",
        previousTier,
        newTier,
        previousCreditsPerMonth: previousMonthlyCredits,
        newCreditsPerMonth: newMonthlyCredits,
        creditsToAdd: 0,
        reason: "Subscription update on same product - no additional credits",
      };
    }

    // CASE 2b: Different product = TIER CHANGE (upgrade or downgrade)
    if (newTierLevel > previousTierLevel) {
      // UPGRADE: Give credit DIFFERENCE only
      // User already received credits for their previous tier this billing period
      const creditDifference = Math.max(0, newMonthlyCredits - previousMonthlyCredits);
      
      return {
        type: "upgrade",
        previousTier,
        newTier,
        previousCreditsPerMonth: previousMonthlyCredits,
        newCreditsPerMonth: newMonthlyCredits,
        creditsToAdd: creditDifference,
        reason: `Upgrade from ${previousTier} (${previousMonthlyCredits}) to ${newTier} (${newMonthlyCredits}) - ${creditDifference} credits difference added`,
      };
    }

    if (newTierLevel < previousTierLevel) {
      // DOWNGRADE: No credits (user already has more than new plan provides)
      return {
        type: "downgrade",
        previousTier,
        newTier,
        previousCreditsPerMonth: previousMonthlyCredits,
        newCreditsPerMonth: newMonthlyCredits,
        creditsToAdd: 0,
        reason: `Downgrade from ${previousTier} to ${newTier} - no additional credits`,
      };
    }

    // Same tier level via subscription_update = shouldn't happen
    return {
      type: "billing_cycle_change",
      previousTier,
      newTier,
      previousCreditsPerMonth: previousMonthlyCredits,
      newCreditsPerMonth: newMonthlyCredits,
      creditsToAdd: 0,
      reason: "Subscription update with same tier level - no additional credits",
    };
  }

  // ============================================================================
  // CASE 3: New subscription via checkout (origin: "web" or "subscription_charge")
  // These indicate initial purchases via Paddle checkout
  // subscription.created webhook fires first and sets subscription data,
  // then transaction.completed fires - we should still allocate credits
  // ============================================================================
  if (origin === "web" || origin === "subscription_charge") {
    // Check if this might be a genuinely new subscription
    // subscription.created sets subscription_changed_at, but for NEW subs it won't have previous markers
    const hasPreviousMarkers = !!existingSubscription?.previous_product_id;
    
    // If no previous markers exist, this is a fresh subscription (not an upgrade)
    // The subscription.created webhook already set up the subscription data
    if (!hasPreviousMarkers) {
      return {
        type: "new_subscription",
        previousTier: null,
        newTier,
        previousCreditsPerMonth: 0,
        newCreditsPerMonth: newMonthlyCredits,
        creditsToAdd: newCredits,
        reason: `New subscription via checkout (origin: ${origin}) - full credits allocated`,
      };
    }
    
    // If there ARE previous markers, this might be a re-subscription or special case
    // Handle based on tier comparison
    const previousProductId = existingSubscription?.previous_product_id;
    const previousTier = previousProductId ? (PRODUCT_TO_TIER[previousProductId] || "pro") : "pro";
    const previousMonthlyCredits = previousProductId ? (MONTHLY_CREDITS[previousProductId] || 0) : 0;
    const previousTierLevel = PLAN_TIER_HIERARCHY[previousTier] || 0;
    const newTierLevel = PLAN_TIER_HIERARCHY[newTier] || 0;
    
    if (newTierLevel > previousTierLevel) {
      const creditDifference = Math.max(0, newMonthlyCredits - previousMonthlyCredits);
      return {
        type: "upgrade",
        previousTier,
        newTier,
        previousCreditsPerMonth: previousMonthlyCredits,
        newCreditsPerMonth: newMonthlyCredits,
        creditsToAdd: creditDifference,
        reason: `Upgrade via checkout from ${previousTier} to ${newTier} - ${creditDifference} credits difference`,
      };
    }
    
    // Same tier or downgrade via checkout - give full credits (user is paying again)
    return {
      type: "new_subscription",
      previousTier,
      newTier,
      previousCreditsPerMonth: previousMonthlyCredits,
      newCreditsPerMonth: newMonthlyCredits,
      creditsToAdd: newCredits,
      reason: `Subscription via checkout (origin: ${origin}) - full credits allocated`,
    };
  }

  // ============================================================================
  // CASE 4: No existing subscription - NEW SUBSCRIPTION
  // ============================================================================
  if (!existingSubscription || !existingSubscription.product_id || existingSubscription.status === "canceled") {
    return {
      type: "new_subscription",
      previousTier: null,
      newTier,
      previousCreditsPerMonth: 0,
      newCreditsPerMonth: newMonthlyCredits,
      creditsToAdd: newCredits,
      reason: "New subscription - full credits allocated",
    };
  }

  // ============================================================================
  // CASE 5: Other origins (api, etc.) - edge cases
  // These are less common and need careful handling
  // ============================================================================
  const previousTier = PRODUCT_TO_TIER[existingSubscription.product_id] || "pro";
  const previousMonthlyCredits = MONTHLY_CREDITS[existingSubscription.product_id] || 0;
  const previousBillingCycle = existingSubscription.billing_cycle || 
    (existingSubscription.price_id ? getBillingCycle(existingSubscription.price_id) : "monthly");
  
  const previousTierLevel = PLAN_TIER_HIERARCHY[previousTier] || 0;
  const newTierLevel = PLAN_TIER_HIERARCHY[newTier] || 0;

  // CASE 5a: Same product but different billing cycle
  if (existingSubscription.product_id === newProductId && existingSubscription.price_id !== newPriceId) {
    if (previousBillingCycle !== newBillingCycle) {
      return {
        type: "billing_cycle_change",
        previousTier,
        newTier,
        previousCreditsPerMonth: previousMonthlyCredits,
        newCreditsPerMonth: newMonthlyCredits,
        creditsToAdd: 0,
        reason: `Billing cycle change (${previousBillingCycle} → ${newBillingCycle}) - no additional credits`,
      };
    }
  }

  // CASE 5b: Same plan, same price via non-checkout origin
  // This is likely an API-triggered duplicate or edge case
  if (existingSubscription.product_id === newProductId && existingSubscription.price_id === newPriceId) {
    return {
      type: "billing_cycle_change",
      previousTier,
      newTier,
      previousCreditsPerMonth: previousMonthlyCredits,
      newCreditsPerMonth: newMonthlyCredits,
      creditsToAdd: 0,
      reason: `Same plan and price (origin: ${origin}) - no additional credits`,
    };
  }

  // CASE 5c: Upgrade to higher tier
  if (newTierLevel > previousTierLevel) {
    const creditDifference = Math.max(0, newMonthlyCredits - previousMonthlyCredits);
    return {
      type: "upgrade",
      previousTier,
      newTier,
      previousCreditsPerMonth: previousMonthlyCredits,
      newCreditsPerMonth: newMonthlyCredits,
      creditsToAdd: creditDifference,
      reason: `Upgrade from ${previousTier} to ${newTier} - ${creditDifference} credits difference added`,
    };
  }

  // CASE 5d: Downgrade to lower tier
  if (newTierLevel < previousTierLevel) {
    return {
      type: "downgrade",
      previousTier,
      newTier,
      previousCreditsPerMonth: previousMonthlyCredits,
      newCreditsPerMonth: newMonthlyCredits,
      creditsToAdd: 0,
      reason: `Downgrade from ${previousTier} to ${newTier} - no additional credits`,
    };
  }

  // CASE 5e: Same tier level - edge case, no credits
  return {
    type: "billing_cycle_change",
    previousTier,
    newTier,
    previousCreditsPerMonth: previousMonthlyCredits,
    newCreditsPerMonth: newMonthlyCredits,
    creditsToAdd: 0,
    reason: `Same tier level (origin: ${origin}) - no additional credits`,
  };
}

/**
 * Find user by multiple lookup strategies
 * Priority: 1) subscription.id, 2) customerId, 3) custom_data.user_id
 */
async function findUserForSubscription(
  subscriptionId: string,
  customerId: string,
  customData?: PaddleCustomData | string
): Promise<typeof User.prototype | null> {
  await dbConnect();

  // 1. Try to find by subscription ID
  let user = await User.findOne({ "subscription.id": subscriptionId });
  if (user) {
    console.log(`[Webhook] Found user by subscription.id: ${user._id}`);
    return user;
  }

  // 2. Try to find by customer ID
  user = await User.findOne({ customerId: customerId });
  if (user) {
    console.log(`[Webhook] Found user by customerId: ${user._id}`);
    return user;
  }

  // 3. Try to find by user_id in custom_data
  const parsedCustomData = parseCustomData(customData);
  if (parsedCustomData?.user_id) {
    user = await User.findById(parsedCustomData.user_id);
    if (user) {
      console.log(`[Webhook] Found user by custom_data.user_id: ${user._id}`);
      return user;
    }
  }

  console.error(`[Webhook] User not found - tried subscription.id: ${subscriptionId}, customerId: ${customerId}, custom_data.user_id: ${parsedCustomData?.user_id}`);
  return null;
}

/**
 * Handle subscription.created event
 * Creates subscription record
 * Note: Credits are added via transaction.completed event
 */
export async function handleSubscriptionCreated(data: PaddleSubscriptionEvent): Promise<void> {
  logInfo("[Webhook] Processing subscription.created", { 
    subscriptionId: data.id,
    customerId: data.customer_id,
    status: data.status,
  });
  
  await dbConnect();

  // Extract user_id from custom_data
  const customData = parseCustomData(data.custom_data);
  const userId = customData?.user_id;

  if (!userId) {
    logError("[Webhook] No user_id in custom_data for subscription.created", new Error("Missing user_id"));
    throw new Error("Missing user_id in custom_data");
  }

  const user = await User.findById(userId);
  if (!user) {
    logError("[Webhook] User not found", new Error("User not found"), { userId });
    throw new Error(`User not found: ${userId}`);
  }

  // Get price info from first item
  const firstItem = data.items[0];
  if (!firstItem) {
    logError("[Webhook] No items in subscription", new Error("No items"), { 
      subscriptionId: data.id,
      items: data.items,
    });
    throw new Error("No items in subscription");
  }

  const priceId = firstItem.price.id;
  const productId = firstItem.price.product_id;
  const planName = getPlanNameFromPriceId(priceId);
  const planTier = PRODUCT_TO_TIER[productId] || "pro";
  const billingCycle = getBillingCycle(priceId);

  // Log the extracted data for debugging
  logInfo("[Webhook] Subscription items extracted", {
    subscriptionId: data.id,
    priceId,
    productId,
    planName,
    planTier,
    billingCycle,
    customDataPlanName: customData?.plan_name,
    customDataBillingCycle: customData?.billing_cycle,
  });

  // Calculate billing period timestamps
  const periodStart = data.current_billing_period?.starts_at 
    ? new Date(data.current_billing_period.starts_at).getTime() 
    : Date.now();
  const periodEnd = data.current_billing_period?.ends_at 
    ? new Date(data.current_billing_period.ends_at).getTime() 
    : undefined;

  // Calculate next credit date for annual plans (30 days from now for next monthly allocation)
  const now = Date.now();
  const nextCreditDate = billingCycle === "annual" 
    ? now + (30 * 24 * 60 * 60 * 1000) // 30 days from now
    : undefined;

  // Check if this is a change from an existing subscription (upgrade, billing cycle change, etc.)
  const existingSubscription = user.subscription;
  
  // Detect what kind of change this is:
  // - Tier upgrade: product_id changed to higher tier
  // - Billing cycle change: same product_id but different price_id (e.g., monthly → annual)
  // - New subscription: no existing subscription or completely new
  const hasExistingSubscription = !!existingSubscription?.product_id;
  const isTierChange = hasExistingSubscription && existingSubscription.product_id !== productId;
  const isBillingCycleChange = hasExistingSubscription && 
    existingSubscription.product_id === productId && 
    existingSubscription.price_id !== priceId;
  const isSubscriptionChange = isTierChange || isBillingCycleChange;
  
  // Update user subscription
  const subscriptionUpdate: Record<string, unknown> = {
    id: data.id,
    customerId: data.customer_id,
    product_id: productId,
    price_id: priceId,
    status: PADDLE_STATUS_MAP[data.status] || data.status,
    current_period_start: periodStart,
    current_period_ends: periodEnd,
    billing_cycle: billingCycle,
    plan_tier: planTier,
    plan_name: planName,
    started_at: data.started_at ? new Date(data.started_at).getTime() : Date.now(),
    cancel_at_period_end: false,
    next_payment_date: data.next_billed_at ? new Date(data.next_billed_at).getTime() : undefined,
  };

  // IMPORTANT: Preserve previous subscription info for transaction.completed to detect:
  // - Tier upgrades (Pro → Ultimate): should add credit difference
  // - Billing cycle changes (monthly → annual): should add 0 credits
  // This data is cleared after transaction.completed processes it
  if (isSubscriptionChange) {
    subscriptionUpdate.previous_product_id = existingSubscription.product_id;
    subscriptionUpdate.previous_price_id = existingSubscription.price_id;
    subscriptionUpdate.previous_plan_tier = existingSubscription.plan_tier;
    subscriptionUpdate.previous_billing_cycle = existingSubscription.billing_cycle;
    subscriptionUpdate.subscription_changed_at = Date.now();
    
    logInfo("[Webhook] Subscription change detected in subscription.created", {
      userId,
      changeType: isTierChange ? "tier_change" : "billing_cycle_change",
      previousProductId: existingSubscription.product_id,
      previousPriceId: existingSubscription.price_id,
      previousPlanTier: existingSubscription.plan_tier,
      previousBillingCycle: existingSubscription.billing_cycle,
      newProductId: productId,
      newPriceId: priceId,
      newPlanTier: planTier,
      newBillingCycle: billingCycle,
    });
  }

  // Add monthly credit tracking for annual plans
  if (billingCycle === "annual") {
    subscriptionUpdate.next_credit_date = nextCreditDate;
    subscriptionUpdate.last_credit_date = now; // First credits added at subscription creation
  }

  // Log what we're saving for debugging
  if (isSubscriptionChange) {
    logInfo("[Webhook] Saving subscription with change markers", {
      userId,
      previousProductId: subscriptionUpdate.previous_product_id,
      previousPriceId: subscriptionUpdate.previous_price_id,
      previousBillingCycle: subscriptionUpdate.previous_billing_cycle,
    });
  }

  // IMPORTANT: Check if user.subscription is null
  // MongoDB cannot set nested fields using dot notation when parent is null
  // In that case, we need to set the entire subscription object at once
  const userSubscriptionIsNull = user.subscription === null || user.subscription === undefined;
  
  let updatedUser;
  
  if (userSubscriptionIsNull) {
    // Set the entire subscription object at once (replaces null with object)
    logInfo("[Webhook] User subscription is null, setting entire object", { userId });
    
    // Filter out undefined values from subscriptionUpdate
    const cleanSubscriptionUpdate: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(subscriptionUpdate)) {
      if (value !== undefined) {
        cleanSubscriptionUpdate[key] = value;
      }
    }
    
    updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          customerId: data.customer_id,
          subscription: cleanSubscriptionUpdate,
        } 
      },
      { new: true }
    );
  } else {
    // User already has a subscription object, use dot notation for partial updates
    const setFields: Record<string, unknown> = {
      customerId: data.customer_id,
    };
    
    // Add all subscription fields with dot notation
    for (const [key, value] of Object.entries(subscriptionUpdate)) {
      if (value !== undefined) {
        setFields[`subscription.${key}`] = value;
      }
    }
    
    updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: setFields },
      { new: true }
    );
  }

  // Verify the update was applied correctly
  if (!updatedUser) {
    logError("[Webhook] Failed to update user - user not found after update", new Error("Update failed"), { userId });
    throw new Error(`Failed to update subscription for user ${userId}`);
  }

  // Verify the subscription was actually updated
  if (updatedUser.subscription?.id !== data.id) {
    logError("[Webhook] Subscription update verification failed", new Error("Subscription ID mismatch"), {
      userId,
      expectedSubId: data.id,
      actualSubId: updatedUser.subscription?.id,
      expectedPlanName: planName,
      actualPlanName: updatedUser.subscription?.plan_name,
    });
    throw new Error(`Subscription update verification failed for user ${userId}`);
  }

  // Verify subscription change markers were saved (for debugging)
  if (isSubscriptionChange) {
    logInfo("[Webhook] Verifying subscription change markers saved", {
      userId,
      markersSet: !!updatedUser.subscription?.previous_product_id,
      previousProductId: updatedUser.subscription?.previous_product_id,
      previousPriceId: updatedUser.subscription?.previous_price_id,
      previousBillingCycle: updatedUser.subscription?.previous_billing_cycle,
    });
  }

  logInfo("[Webhook] Subscription created successfully", { 
    userId, 
    subscriptionId: data.id,
    planName,
    planTier,
    billingCycle,
    priceId,
    productId,
    verified: true,
  });
}

/**
 * Handle subscription.updated event
 * Updates subscription status and details
 * 
 * IMPORTANT: This handler PRESERVES previous subscription state for transaction.completed
 * to use when determining credit allocation. This handles the webhook race condition where
 * subscription.updated fires before transaction.completed.
 * 
 * NOTE: Credits are handled by transaction.completed webhook, NOT here.
 */
export async function handleSubscriptionUpdated(data: PaddleSubscriptionEvent): Promise<void> {
  logInfo("[Webhook] Processing subscription.updated", { 
    subscriptionId: data.id,
    status: data.status,
  });
  
  await dbConnect();

  const user = await findUserForSubscription(data.id, data.customer_id, data.custom_data);
  if (!user) {
    logWarn("[Webhook] User not found for subscription.updated", { subscriptionId: data.id });
    return;
  }

  const userId = user._id.toString();
  const existingSubscription = user.subscription;
  
  // Get new price info from webhook
  const firstItem = data.items[0];
  const newPriceId = firstItem?.price.id;
  const newProductId = firstItem?.price.product_id;

  // Detect what changed
  const oldProductId = existingSubscription?.product_id;
  const oldPriceId = existingSubscription?.price_id;
  const oldBillingCycle = existingSubscription?.billing_cycle;
  
  const isPlanChange = newProductId && oldProductId && newProductId !== oldProductId;
  const isPriceChange = newPriceId && oldPriceId && newPriceId !== oldPriceId;
  const isAnyChange = isPlanChange || isPriceChange;

  if (isAnyChange) {
    const oldTier = oldProductId ? (PRODUCT_TO_TIER[oldProductId] || "unknown") : "none";
    const newTier = newProductId ? (PRODUCT_TO_TIER[newProductId] || "unknown") : "none";
    const newBillingCycle = newPriceId ? getBillingCycle(newPriceId) : "unknown";
    
    logInfo("[Webhook] Subscription change detected in subscription.updated", {
      userId,
      subscriptionId: data.id,
      changeType: isPlanChange ? "tier_change" : "price_change",
      oldProductId,
      newProductId,
      oldPriceId,
      newPriceId,
      oldBillingCycle,
      newBillingCycle,
      oldTier,
      newTier,
    });
  }

  // Build update object
  const updateFields: Record<string, unknown> = {
    "subscription.status": PADDLE_STATUS_MAP[data.status] || data.status,
  };

  // CRITICAL: Preserve previous state BEFORE updating to new values
  // This allows transaction.completed to correctly analyze what changed
  if (isAnyChange && oldProductId && oldPriceId) {
    // Only set markers if they don't already exist (prevent overwriting if webhook fires twice)
    if (!existingSubscription?.previous_product_id) {
      updateFields["subscription.previous_product_id"] = oldProductId;
      updateFields["subscription.previous_price_id"] = oldPriceId;
      updateFields["subscription.previous_billing_cycle"] = oldBillingCycle || "monthly";
      updateFields["subscription.previous_plan_tier"] = PRODUCT_TO_TIER[oldProductId] || "pro";
      updateFields["subscription.subscription_changed_at"] = Date.now();
      
      logInfo("[Webhook] Preserving previous subscription state for transaction.completed", {
        userId,
        subscriptionId: data.id,
        previousProductId: oldProductId,
        previousPriceId: oldPriceId,
        previousBillingCycle: oldBillingCycle,
      });
    }
  }

  // Update to new values
  if (newPriceId) {
    updateFields["subscription.price_id"] = newPriceId;
    updateFields["subscription.billing_cycle"] = getBillingCycle(newPriceId);
    updateFields["subscription.plan_name"] = getPlanNameFromPriceId(newPriceId);
  }

  if (newProductId) {
    updateFields["subscription.product_id"] = newProductId;
    updateFields["subscription.plan_tier"] = PRODUCT_TO_TIER[newProductId] || "pro";
  }

  if (data.current_billing_period) {
    updateFields["subscription.current_period_start"] = new Date(data.current_billing_period.starts_at).getTime();
    updateFields["subscription.current_period_ends"] = new Date(data.current_billing_period.ends_at).getTime();
  }

  if (data.next_billed_at) {
    updateFields["subscription.next_payment_date"] = new Date(data.next_billed_at).getTime();
  }

  // Check for scheduled cancellation
  if (data.scheduled_change?.action === "cancel") {
    updateFields["subscription.cancel_at_period_end"] = true;
  } else {
    updateFields["subscription.cancel_at_period_end"] = false;
  }

  await User.findByIdAndUpdate(userId, { $set: updateFields });
  
  logInfo("[Webhook] Subscription updated", { 
    userId, 
    subscriptionId: data.id,
    status: data.status,
    changeDetected: isAnyChange,
    previousStatePreserved: isAnyChange && !!oldProductId && !!oldPriceId,
  });
}

/**
 * Handle subscription.canceled event
 * Marks subscription as canceled but retains access until period end
 */
export async function handleSubscriptionCanceled(data: PaddleSubscriptionEvent): Promise<void> {
  console.log(`[Webhook] Processing subscription.canceled: ${data.id}`);
  
  await dbConnect();

  const user = await findUserForSubscription(data.id, data.customer_id, data.custom_data);
  if (!user) {
    console.warn(`[Webhook] User not found for subscription.canceled ${data.id}`);
    return;
  }

  const canceledAt = data.canceled_at ? new Date(data.canceled_at).getTime() : Date.now();

  await User.findByIdAndUpdate(user._id, {
    $set: {
      "subscription.status": "canceled",
      "subscription.canceled_at": canceledAt,
      "subscription.cancel_at_period_end": true,
      "subscription.cancel_reason": "user_requested",
    },
  });

  console.log(`[Webhook] Subscription canceled for user ${user._id}`);
}

/**
 * Handle subscription.activated event
 */
export async function handleSubscriptionActivated(data: PaddleSubscriptionEvent): Promise<void> {
  console.log(`[Webhook] Processing subscription.activated: ${data.id}`);
  
  await dbConnect();

  const user = await findUserForSubscription(data.id, data.customer_id, data.custom_data);
  if (!user) {
    // Log warning but don't fail - subscription.created might not have processed yet
    console.warn(`[Webhook] User not found for subscription.activated ${data.id} - will be handled by transaction.completed`);
    return;
  }

  // Check if user.subscription is null - if so, set entire object to avoid MongoDB error
  const userSubscriptionIsNull = user.subscription === null || user.subscription === undefined;
  
  if (userSubscriptionIsNull) {
    // Set the entire subscription object at once
    await User.findByIdAndUpdate(user._id, {
      $set: {
        subscription: {
          id: data.id,
          status: "active",
          cancel_at_period_end: false,
        },
        customerId: data.customer_id,
      },
    });
  } else {
    // Use dot notation for partial update
    await User.findByIdAndUpdate(user._id, {
      $set: {
        "subscription.id": data.id,
        "subscription.status": "active",
        "subscription.cancel_at_period_end": false,
        customerId: data.customer_id,
      },
    });
  }

  console.log(`[Webhook] Subscription activated for user ${user._id}`);
}

/**
 * Handle subscription.paused event
 */
export async function handleSubscriptionPaused(data: PaddleSubscriptionEvent): Promise<void> {
  console.log(`[Webhook] Processing subscription.paused: ${data.id}`);
  
  await dbConnect();

  const user = await findUserForSubscription(data.id, data.customer_id, data.custom_data);
  if (!user) {
    console.warn(`[Webhook] User not found for subscription.paused ${data.id}`);
    return;
  }

  await User.findByIdAndUpdate(user._id, {
    $set: {
      "subscription.status": "paused",
    },
  });

  console.log(`[Webhook] Subscription paused for user ${user._id}`);
}

/**
 * Handle subscription.resumed event
 */
export async function handleSubscriptionResumed(data: PaddleSubscriptionEvent): Promise<void> {
  console.log(`[Webhook] Processing subscription.resumed: ${data.id}`);
  
  await dbConnect();

  const user = await findUserForSubscription(data.id, data.customer_id, data.custom_data);
  if (!user) {
    console.warn(`[Webhook] User not found for subscription.resumed ${data.id}`);
    return;
  }

  await User.findByIdAndUpdate(user._id, {
    $set: {
      "subscription.status": "active",
    },
  });

  console.log(`[Webhook] Subscription resumed for user ${user._id}`);
}

/**
 * Handle transaction.completed event
 * Adds credits for successful payments with proper upgrade/downgrade handling
 * 
 * CREDIT RULES:
 * - NEW subscription: Full credits
 * - RENEWAL: Full credits
 * - UPGRADE: Prorated difference only (user already has credits from previous plan)
 * - DOWNGRADE: No credits (user already has more than new plan provides)
 * - ADD-ON: Credits based on quantity
 */
export async function handleTransactionCompleted(data: PaddleTransactionEvent): Promise<void> {
  logInfo("[Webhook] Processing transaction.completed", {
    transactionId: data.id,
    subscriptionId: data.subscription_id,
    customerId: data.customer_id,
    origin: data.origin,
  });
  
  await dbConnect();

  // Extract user_id from custom_data
  const customData = parseCustomData(data.custom_data);
  const customDataUserId = customData?.user_id;

  // Find user - try multiple strategies
  let user;
  
  // Strategy 1: Find by custom_data user_id (most reliable for new subscriptions)
  if (customDataUserId) {
    user = await User.findById(customDataUserId);
    if (user) {
      logInfo("[Webhook] Found user by custom_data.user_id", { userId: customDataUserId });
    }
  }
  
  // Strategy 2: Find by subscription ID (for renewals/upgrades)
  if (!user && data.subscription_id) {
    user = await User.findOne({ "subscription.id": data.subscription_id });
    if (user) {
      logInfo("[Webhook] Found user by subscription.id", { subscriptionId: data.subscription_id });
    }
  }
  
  // Strategy 3: Find by Paddle customer ID
  if (!user && data.customer_id) {
    user = await User.findOne({ customerId: data.customer_id });
    if (user) {
      logInfo("[Webhook] Found user by customerId", { customerId: data.customer_id });
    }
  }

  if (!user) {
    logError("[Webhook] User not found for transaction", new Error("User not found"), {
      transactionId: data.id,
      subscriptionId: data.subscription_id,
      customerId: data.customer_id,
    });
    throw new Error(`User not found for transaction ${data.id}`);
  }

  const userId = user._id.toString();
  const existingSubscription = user.subscription;

  // Debug: Log existing subscription state to diagnose marker issues
  logInfo("[Webhook] Existing subscription state", {
    transactionId: data.id,
    userId,
    subscriptionId: existingSubscription?.id,
    productId: existingSubscription?.product_id,
    priceId: existingSubscription?.price_id,
    billingCycle: existingSubscription?.billing_cycle,
    hasPreviousMarkers: !!existingSubscription?.previous_product_id,
    previousProductId: existingSubscription?.previous_product_id,
    previousPriceId: existingSubscription?.previous_price_id,
    previousBillingCycle: existingSubscription?.previous_billing_cycle,
  });

  // Get item details
  const firstItem = data.items[0];
  if (!firstItem) {
    logWarn("[Webhook] Transaction has no items", { transactionId: data.id });
    return;
  }

  const priceId = firstItem.price.id;
  const productId = firstItem.price.product_id;
  const planName = getPlanNameFromPriceId(priceId);
  const newBillingCycle = getBillingCycle(priceId);

  // Check if subscription.created already ran and preserved previous subscription info
  // This handles the race condition where subscription.created fires before transaction.completed
  const hasPreviousSubscriptionMarkers = !!existingSubscription?.previous_product_id;
  
  // Determine what changed
  const previousProductId = hasPreviousSubscriptionMarkers 
    ? existingSubscription.previous_product_id 
    : existingSubscription?.product_id;
  const previousPriceId = hasPreviousSubscriptionMarkers 
    ? existingSubscription.previous_price_id 
    : existingSubscription?.price_id;
  const previousBillingCycle = hasPreviousSubscriptionMarkers 
    ? existingSubscription.previous_billing_cycle 
    : existingSubscription?.billing_cycle;

  // Detect the type of subscription change
  const isTierChange = previousProductId && previousProductId !== productId;
  const isBillingCycleChange = previousProductId === productId && previousPriceId !== priceId;
  const wasSubscriptionChange = hasPreviousSubscriptionMarkers && (isTierChange || isBillingCycleChange);

  if (wasSubscriptionChange) {
    logInfo("[Webhook] Detected subscription change from markers", {
      transactionId: data.id,
      changeType: isTierChange ? "tier_change" : "billing_cycle_change",
      previousProductId,
      previousPriceId,
      previousBillingCycle,
      newProductId: productId,
      newPriceId: priceId,
      newBillingCycle,
    });
  }

  // Analyze the transaction to determine credit allocation
  // Pass full subscription info including previous state markers
  const analysis = analyzeTransaction(
    data.origin,
    productId,
    priceId,
    existingSubscription ? {
      // Current subscription state (may already be updated by subscription.updated webhook)
      product_id: existingSubscription.product_id,
      price_id: existingSubscription.price_id,
      billing_cycle: existingSubscription.billing_cycle,
      current_period_start: existingSubscription.current_period_start,
      current_period_ends: existingSubscription.current_period_ends,
      status: existingSubscription.status,
      // Previous state markers (set by subscription.updated webhook before updating)
      previous_product_id: existingSubscription.previous_product_id,
      previous_price_id: existingSubscription.previous_price_id,
      previous_billing_cycle: existingSubscription.previous_billing_cycle,
    } : null
  );

  logInfo("[Webhook] Transaction analysis", {
    transactionId: data.id,
    userId,
    type: analysis.type,
    previousTier: analysis.previousTier,
    newTier: analysis.newTier,
    creditsToAdd: analysis.creditsToAdd,
    reason: analysis.reason,
  });

  // Add credits based on analysis
  if (analysis.creditsToAdd > 0) {
    // Determine transaction type for ledger
    let transactionType: "subscription_credit" | "subscription_renewal" | "addon_purchase";
    let description: string;

    switch (analysis.type) {
      case "renewal":
        transactionType = "subscription_renewal";
        description = `${planName} subscription renewal`;
        break;
      case "upgrade":
        transactionType = "subscription_credit";
        description = `${planName} upgrade - prorated credits (${analysis.previousTier} → ${analysis.newTier})`;
        break;
      case "new_subscription":
      default:
        transactionType = "subscription_credit";
        description = `${planName} subscription`;
        break;
    }

    // Add credits using CreditService
    const result = await CreditService.addCredits({
      userId,
      amount: analysis.creditsToAdd,
      type: transactionType,
      description,
      source: "paddle_webhook",
      transactionId: data.id,
      subscriptionId: data.subscription_id,
      customerId: data.customer_id,
      priceId: priceId,
      productId: productId,
      idempotencyKey: `paddle_txn_${data.id}`,
      metadata: {
        transaction_type: analysis.type,
        previous_tier: analysis.previousTier,
        new_tier: analysis.newTier,
        origin: data.origin,
      },
    });

    if (result.success) {
      logInfo("[Webhook] Credits added successfully", {
        userId,
        amount: analysis.creditsToAdd,
        balanceBefore: result.balance_before,
        balanceAfter: result.balance_after,
        transactionType: analysis.type,
      });
    } else {
      logError("[Webhook] Failed to add credits", new Error(result.error || "Unknown"), {
        userId,
        amount: analysis.creditsToAdd,
        errorCode: result.error_code,
      });
    }
  } else {
    logInfo("[Webhook] No credits to add for this transaction", {
      userId,
      transactionId: data.id,
      type: analysis.type,
      reason: analysis.reason,
    });
  }

  // Update subscription with latest transaction info (only if user has a subscription)
  // This prevents MongoDB error when trying to set nested fields on null subscription
  if (existingSubscription) {
    const paymentAmount = data.details?.totals?.total 
      ? parseInt(data.details.totals.total, 10) 
      : undefined;

    const updateFields: Record<string, unknown> = {
      "subscription.transaction_id": data.id,
      "subscription.last_payment_date": data.billed_at ? new Date(data.billed_at).getTime() : Date.now(),
    };

    if (paymentAmount) {
      updateFields["subscription.last_payment_amount"] = paymentAmount;
    }

    // Clear subscription change markers after processing (so future renewals aren't confused)
    const unsetFields: Record<string, 1> = {};
    if (hasPreviousSubscriptionMarkers) {
      unsetFields["subscription.previous_product_id"] = 1;
      unsetFields["subscription.previous_price_id"] = 1;
      unsetFields["subscription.previous_plan_tier"] = 1;
      unsetFields["subscription.previous_billing_cycle"] = 1;
      unsetFields["subscription.subscription_changed_at"] = 1;
    }

    const updateQuery: Record<string, unknown> = { $set: updateFields };
    if (Object.keys(unsetFields).length > 0) {
      updateQuery.$unset = unsetFields;
    }

    await User.findByIdAndUpdate(userId, updateQuery);
  } else {
    logWarn("[Webhook] Skipping subscription update - user has no subscription", {
      userId,
      transactionId: data.id,
    });
  }
  
  logInfo("[Webhook] Transaction completed", {
    transactionId: data.id,
    userId,
    creditsAdded: analysis.creditsToAdd,
    type: analysis.type,
  });
}

/**
 * Handle transaction.payment_failed event
 */
export async function handleTransactionPaymentFailed(data: PaddleTransactionEvent): Promise<void> {
  logInfo("[Webhook] Processing transaction.payment_failed", { transactionId: data.id });
  
  await dbConnect();

  // Find user
  let user;
  if (data.subscription_id) {
    user = await User.findOne({ "subscription.id": data.subscription_id });
  }
  
  if (!user && data.customer_id) {
    user = await User.findOne({ customerId: data.customer_id });
  }

  if (!user) {
    logWarn("[Webhook] User not found for failed transaction", { transactionId: data.id });
    return; // Don't throw, just log
  }

  // Update subscription status to past_due
  await User.findByIdAndUpdate(user._id, {
    $set: {
      "subscription.status": "past_due",
    },
  });

  logInfo("[Webhook] Payment failed - status updated to past_due", { 
    userId: user._id, 
    transactionId: data.id 
  });
}

// ============================================================================
// ADJUSTMENT/REFUND HANDLERS
// ============================================================================

interface PaddleAdjustmentItem {
  item_id: string;
  type: string;
  amount: string;
  proration?: {
    rate: string;
    billing_period: {
      starts_at: string;
      ends_at: string;
    };
  };
  totals: {
    subtotal: string;
    tax: string;
    total: string;
  };
}

interface PaddleAdjustmentEvent {
  id: string;
  action: "refund" | "credit" | "chargeback" | "chargeback_warning";
  transaction_id: string;
  subscription_id?: string;
  customer_id: string;
  reason: string;
  credit_applied_to_balance: boolean;
  currency_code: string;
  status: "pending_approval" | "approved" | "rejected" | "reversed";
  items: PaddleAdjustmentItem[];
  totals: {
    subtotal: string;
    tax: string;
    total: string;
    fee: string;
    earnings: string;
    currency_code: string;
  };
  payout_totals?: {
    subtotal: string;
    tax: string;
    total: string;
  };
  created_at: string;
  updated_at?: string;
}

/**
 * Handle adjustment.created event
 * Deducts credits for refunds and chargebacks
 * 
 * Adjustment types:
 * - refund: Customer requested refund
 * - credit: Credit applied to customer
 * - chargeback: Payment disputed by customer
 * - chargeback_warning: Warning of potential chargeback
 */
export async function handleAdjustmentCreated(data: PaddleAdjustmentEvent): Promise<void> {
  logInfo("[Webhook] Processing adjustment.created", {
    adjustmentId: data.id,
    action: data.action,
    status: data.status,
    transactionId: data.transaction_id,
    customerId: data.customer_id,
  });

  await dbConnect();

  // Only process approved adjustments
  if (data.status !== "approved") {
    logInfo("[Webhook] Adjustment not approved yet, skipping credit deduction", {
      adjustmentId: data.id,
      status: data.status,
    });
    return;
  }

  // Find user
  let user;
  if (data.subscription_id) {
    user = await User.findOne({ "subscription.id": data.subscription_id });
  }
  if (!user && data.customer_id) {
    user = await User.findOne({ customerId: data.customer_id });
  }

  if (!user) {
    logWarn("[Webhook] User not found for adjustment", { 
      adjustmentId: data.id,
      customerId: data.customer_id 
    });
    return;
  }

  const userId = user._id.toString();

  // Calculate credits to deduct based on refund amount
  // For simplicity, we deduct credits proportional to the refund
  // In production, you might want to track exactly which credits to reverse

  // Find the original transaction in the ledger to determine credits to deduct
  const originalTransaction = await CreditService.getTransactionHistory(userId, {
    limit: 1,
    type: ["subscription_credit", "subscription_renewal", "addon_purchase"],
  }).then(txns => txns.find(t => t.transaction_id === data.transaction_id));

  if (!originalTransaction) {
    logWarn("[Webhook] Original transaction not found in ledger", {
      adjustmentId: data.id,
      transactionId: data.transaction_id,
      userId,
    });
    // Still process the adjustment for record keeping, but we can't determine credits to deduct
    return;
  }

  const originalCredits = originalTransaction.amount;
  
  // For refunds, deduct the full credits from the original transaction
  // In a more sophisticated system, you could track payment amounts and prorate
  // For now, we deduct all credits if it's a full/partial refund
  let creditsToDeduct = originalCredits;

  // Only deduct if user has credits (don't go negative)
  const currentBalance = await CreditService.getBalance(userId);
  creditsToDeduct = Math.min(creditsToDeduct, currentBalance);

  if (creditsToDeduct > 0) {
    // Use deductCredits to remove credits
    const result = await CreditService.deductCredits({
      userId,
      amount: creditsToDeduct,
      description: `${data.action === "chargeback" ? "Chargeback" : "Refund"} adjustment - ${data.reason || "Customer request"}`,
      idempotencyKey: `paddle_adj_${data.id}`,
      metadata: {
        adjustment_id: data.id,
        adjustment_action: data.action,
        original_transaction_id: data.transaction_id,
        refund_total: data.totals.total,
      },
    });

    if (result.success) {
      logInfo("[Webhook] Credits deducted for adjustment", {
        userId,
        creditsDeducted: creditsToDeduct,
        adjustmentId: data.id,
        action: data.action,
        balanceBefore: result.balance_before,
        balanceAfter: result.balance_after,
      });
    } else {
      logError("[Webhook] Failed to deduct credits for adjustment", new Error(result.error || "Unknown"), {
        userId,
        creditsToDeduct,
        adjustmentId: data.id,
      });
    }
  } else {
    logInfo("[Webhook] No credits to deduct for adjustment", {
      userId,
      adjustmentId: data.id,
      currentBalance,
    });
  }

  // If this is a full refund and it's a chargeback, consider canceling the subscription
  if (data.action === "chargeback" && data.subscription_id) {
    await User.findByIdAndUpdate(userId, {
      $set: {
        "subscription.status": "canceled",
        "subscription.canceled_at": Date.now(),
        "subscription.cancel_reason": "chargeback",
      },
    });
    
    logInfo("[Webhook] Subscription canceled due to chargeback", {
      userId,
      subscriptionId: data.subscription_id,
      adjustmentId: data.id,
    });
  }
}

/**
 * Handle adjustment.updated event
 * Processes adjustments that were pending and are now approved
 */
export async function handleAdjustmentUpdated(data: PaddleAdjustmentEvent): Promise<void> {
  logInfo("[Webhook] Processing adjustment.updated", {
    adjustmentId: data.id,
    action: data.action,
    status: data.status,
  });

  // If the adjustment is now approved, process it like a new adjustment
  if (data.status === "approved") {
    await handleAdjustmentCreated(data);
  }
}
