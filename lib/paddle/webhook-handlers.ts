/**
 * Paddle Webhook Event Handlers
 * Production-grade handlers for all Paddle subscription lifecycle events
 */

import User from "@/app/models/User/user.model";
import { dbConnect } from "@/lib/db";
import { 
  getCreditsForPrice, 
  getPlanNameFromPriceId, 
  getBillingCycle,
  PRODUCT_TO_TIER,
  PADDLE_STATUS_MAP,
} from "./config";
import { CreditService } from "@/lib/services/CreditService";

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
  console.log(`[Webhook] Processing subscription.created: ${data.id}`);
  console.log(`[Webhook] Subscription data:`, JSON.stringify({
    id: data.id,
    customer_id: data.customer_id,
    custom_data: data.custom_data,
    status: data.status,
  }, null, 2));
  
  await dbConnect();

  // Extract user_id from custom_data
  const customData = parseCustomData(data.custom_data);
  const userId = customData?.user_id;

  if (!userId) {
    console.error("[Webhook] No user_id in custom_data for subscription.created");
    throw new Error("Missing user_id in custom_data");
  }

  const user = await User.findById(userId);
  if (!user) {
    console.error(`[Webhook] User not found: ${userId}`);
    throw new Error(`User not found: ${userId}`);
  }

  // Get price info from first item
  const firstItem = data.items[0];
  if (!firstItem) {
    throw new Error("No items in subscription");
  }

  const priceId = firstItem.price.id;
  const productId = firstItem.price.product_id;
  const planName = getPlanNameFromPriceId(priceId);
  const planTier = PRODUCT_TO_TIER[productId] || "basic";
  const billingCycle = getBillingCycle(priceId);

  // Calculate billing period timestamps
  const periodStart = data.current_billing_period?.starts_at 
    ? new Date(data.current_billing_period.starts_at).getTime() 
    : Date.now();
  const periodEnd = data.current_billing_period?.ends_at 
    ? new Date(data.current_billing_period.ends_at).getTime() 
    : undefined;

  // Calculate next credit date for annual plans (30 days from now for next monthly allocation)
  const now = Date.now();
  const nextCreditDate = billingCycle === "yearly" 
    ? now + (30 * 24 * 60 * 60 * 1000) // 30 days from now
    : undefined;

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

  // Add monthly credit tracking for annual plans
  if (billingCycle === "yearly") {
    subscriptionUpdate.next_credit_date = nextCreditDate;
    subscriptionUpdate.last_credit_date = now; // First credits added at subscription creation
  }

  await User.findByIdAndUpdate(userId, {
    customerId: data.customer_id,
    subscription: subscriptionUpdate,
  });

  console.log(`[Webhook] Subscription created for user ${userId}: ${planName} (${billingCycle})${billingCycle === "yearly" ? ` - Next credit date: ${new Date(nextCreditDate!).toISOString()}` : ""}`);
}

/**
 * Handle subscription.updated event
 * Updates subscription status and details
 */
export async function handleSubscriptionUpdated(data: PaddleSubscriptionEvent): Promise<void> {
  console.log(`[Webhook] Processing subscription.updated: ${data.id}`);
  
  await dbConnect();

  const user = await findUserForSubscription(data.id, data.customer_id, data.custom_data);
  if (!user) {
    console.warn(`[Webhook] User not found for subscription.updated ${data.id}`);
    return;
  }

  const userId = user._id;
  
  // Get price info
  const firstItem = data.items[0];
  const priceId = firstItem?.price.id;
  const productId = firstItem?.price.product_id;

  // Build update object
  const updateFields: Record<string, unknown> = {
    "subscription.status": PADDLE_STATUS_MAP[data.status] || data.status,
  };

  if (priceId) {
    updateFields["subscription.price_id"] = priceId;
    updateFields["subscription.billing_cycle"] = getBillingCycle(priceId);
    updateFields["subscription.plan_name"] = getPlanNameFromPriceId(priceId);
  }

  if (productId) {
    updateFields["subscription.product_id"] = productId;
    updateFields["subscription.plan_tier"] = PRODUCT_TO_TIER[productId] || "basic";
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
  
  console.log(`[Webhook] Subscription updated for user ${userId}: status=${data.status}`);
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

  // Update subscription status and ensure subscription ID is saved
  await User.findByIdAndUpdate(user._id, {
    $set: {
      "subscription.id": data.id,
      "subscription.status": "active",
      "subscription.cancel_at_period_end": false,
      customerId: data.customer_id,
    },
  });

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
 * Adds credits for successful payments (initial subscription, renewals, add-ons)
 */
export async function handleTransactionCompleted(data: PaddleTransactionEvent): Promise<void> {
  console.log(`[Webhook] Processing transaction.completed: ${data.id}`);
  console.log(`[Webhook] Transaction data:`, JSON.stringify({
    id: data.id,
    subscription_id: data.subscription_id,
    customer_id: data.customer_id,
    custom_data: data.custom_data,
    origin: data.origin,
  }, null, 2));
  
  await dbConnect();

  // Extract user_id from custom_data
  const customData = parseCustomData(data.custom_data);
  const customDataUserId = customData?.user_id;

  console.log(`[Webhook] Looking for user with: subscription_id=${data.subscription_id}, user_id=${customDataUserId}, customer_id=${data.customer_id}`);

  // Find user - try multiple strategies
  let user;
  
  // Strategy 1: Find by custom_data user_id (most reliable for new subscriptions)
  if (customDataUserId) {
    user = await User.findById(customDataUserId);
    if (user) {
      console.log(`[Webhook] Found user by custom_data user_id: ${customDataUserId}`);
    }
  }
  
  // Strategy 2: Find by subscription ID (for renewals)
  if (!user && data.subscription_id) {
    user = await User.findOne({ "subscription.id": data.subscription_id });
    if (user) {
      console.log(`[Webhook] Found user by subscription_id: ${data.subscription_id}`);
    }
  }
  
  // Strategy 3: Find by Paddle customer ID
  if (!user && data.customer_id) {
    user = await User.findOne({ customerId: data.customer_id });
    if (user) {
      console.log(`[Webhook] Found user by customer_id: ${data.customer_id}`);
    }
  }

  if (!user) {
    console.error(`[Webhook] User not found for transaction ${data.id}. Returning 500 to trigger retry.`);
    throw new Error(`User not found for transaction ${data.id}`);
  }

  const userId = user._id.toString();

  // Calculate total credits from all items
  let totalCredits = 0;
  let priceId = "";
  let productId = "";

  for (const item of data.items) {
    priceId = item.price.id;
    productId = item.price.product_id;
    const quantity = item.quantity;
    const credits = getCreditsForPrice(priceId, quantity);
    totalCredits += credits;
  }

  if (totalCredits > 0) {
    // Determine transaction type
    const transactionType = data.origin === "subscription_recurring" 
      ? "subscription_renewal" 
      : "subscription_credit";
    
    const planName = getPlanNameFromPriceId(priceId);
    const description = data.origin === "subscription_recurring"
      ? `${planName} subscription renewal`
      : `${planName} subscription`;

    // Add credits using CreditService
    const result = await CreditService.addCredits({
      userId,
      amount: totalCredits,
      type: transactionType,
      description,
      source: "paddle_webhook",
      transactionId: data.id,
      subscriptionId: data.subscription_id,
      customerId: data.customer_id,
      priceId: priceId,
      productId: productId,
      idempotencyKey: `paddle_txn_${data.id}`,
    });

    if (result.success) {
      console.log(`[Webhook] Added ${totalCredits} credits to user ${userId}. Balance: ${result.balance_before} -> ${result.balance_after}`);
    } else {
      console.error(`[Webhook] Failed to add credits: ${result.error}`);
    }
  }

  // Update subscription with latest transaction info
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

  await User.findByIdAndUpdate(userId, { $set: updateFields });
  
  console.log(`[Webhook] Transaction ${data.id} completed for user ${userId}`);
}

/**
 * Handle transaction.payment_failed event
 */
export async function handleTransactionPaymentFailed(data: PaddleTransactionEvent): Promise<void> {
  console.log(`[Webhook] Processing transaction.payment_failed: ${data.id}`);
  
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
    console.error(`[Webhook] User not found for failed transaction ${data.id}`);
    return; // Don't throw, just log
  }

  // Update subscription status to past_due
  await User.findByIdAndUpdate(user._id, {
    $set: {
      "subscription.status": "past_due",
    },
  });

  console.log(`[Webhook] Payment failed for user ${user._id}, status updated to past_due`);
}
