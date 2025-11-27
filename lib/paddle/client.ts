/**
 * Paddle API Client
 * Server-side client for interacting with Paddle API
 */

import { Paddle, Environment } from '@paddle/paddle-node-sdk';
import { PADDLE_CONFIG, validatePaddleConfig } from './config';

// Singleton instance
let paddleClient: Paddle | null = null;

/**
 * Get or create Paddle client instance
 */
export function getPaddleClient(): Paddle {
  if (!paddleClient) {
    validatePaddleConfig();
    
    paddleClient = new Paddle(PADDLE_CONFIG.apiKey, {
      environment: PADDLE_CONFIG.environment === 'production' 
        ? Environment.production 
        : Environment.sandbox,
    });
  }
  
  return paddleClient;
}

/**
 * Generate a checkout URL for a specific price
 */
export async function generateCheckoutUrl(params: {
  priceId: string;
  userId: string;
  userEmail: string;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<string> {
  const { priceId, userId, userEmail, quantity = 1, successUrl, cancelUrl } = params;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const finalSuccessUrl = successUrl || `${baseUrl}/pricing/success?checkout_id={checkout_id}`;
  const finalCancelUrl = cancelUrl || `${baseUrl}/pricing/cancel`;
  
  // Build the Paddle checkout URL with parameters
  const checkoutParams = new URLSearchParams({
    'items[0][price_id]': priceId,
    'items[0][quantity]': quantity.toString(),
    'customer[email]': userEmail,
    'custom_data[user_id]': userId,
    'checkout[settings][success_url]': finalSuccessUrl,
    // Note: Paddle doesn't have a direct cancel URL param, user closes overlay to cancel
  });
  
  // Return the Paddle checkout URL
  // For redirect checkout, we construct the URL manually
  const environment = PADDLE_CONFIG.environment === 'production' ? '' : 'sandbox-';
  const checkoutUrl = `https://${environment}checkout.paddle.com/checkout/custom-checkout?${checkoutParams.toString()}`;
  
  return checkoutUrl;
}

/**
 * Get subscription details from Paddle
 */
export async function getSubscription(subscriptionId: string) {
  const paddle = getPaddleClient();
  
  try {
    const subscription = await paddle.subscriptions.get(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('[Paddle] Error fetching subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, effectiveFrom: 'immediately' | 'next_billing_period' = 'next_billing_period') {
  const paddle = getPaddleClient();
  
  try {
    const subscription = await paddle.subscriptions.cancel(subscriptionId, {
      effectiveFrom,
    });
    return subscription;
  } catch (error) {
    console.error('[Paddle] Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Pause a subscription
 */
export async function pauseSubscription(subscriptionId: string) {
  const paddle = getPaddleClient();
  
  try {
    const subscription = await paddle.subscriptions.pause(subscriptionId, {});
    return subscription;
  } catch (error) {
    console.error('[Paddle] Error pausing subscription:', error);
    throw error;
  }
}

/**
 * Resume a paused subscription
 */
export async function resumeSubscription(subscriptionId: string) {
  const paddle = getPaddleClient();
  
  try {
    const subscription = await paddle.subscriptions.resume(subscriptionId, {
      effectiveFrom: 'immediately',
    });
    return subscription;
  } catch (error) {
    console.error('[Paddle] Error resuming subscription:', error);
    throw error;
  }
}

/**
 * Update subscription (e.g., change plan)
 */
export async function updateSubscription(subscriptionId: string, newPriceId: string) {
  const paddle = getPaddleClient();
  
  try {
    const subscription = await paddle.subscriptions.update(subscriptionId, {
      items: [{
        priceId: newPriceId,
        quantity: 1,
      }],
      prorationBillingMode: 'prorated_immediately',
    });
    return subscription;
  } catch (error) {
    console.error('[Paddle] Error updating subscription:', error);
    throw error;
  }
}

/**
 * Get customer details from Paddle
 */
export async function getCustomer(customerId: string) {
  const paddle = getPaddleClient();
  
  try {
    const customer = await paddle.customers.get(customerId);
    return customer;
  } catch (error) {
    console.error('[Paddle] Error fetching customer:', error);
    throw error;
  }
}

/**
 * Get transaction details from Paddle
 */
export async function getTransaction(transactionId: string) {
  const paddle = getPaddleClient();
  
  try {
    const transaction = await paddle.transactions.get(transactionId);
    return transaction;
  } catch (error) {
    console.error('[Paddle] Error fetching transaction:', error);
    throw error;
  }
}

/**
 * Create a one-time charge for add-on credits
 */
export async function createAddonTransaction(params: {
  customerId: string;
  priceId: string;
  quantity: number;
}) {
  const paddle = getPaddleClient();
  
  try {
    // For one-time purchases, we need to use the transactions API
    // This requires the customer to already exist in Paddle
    const transaction = await paddle.transactions.create({
      customerId: params.customerId,
      items: [{
        priceId: params.priceId,
        quantity: params.quantity,
      }],
    });
    return transaction;
  } catch (error) {
    console.error('[Paddle] Error creating addon transaction:', error);
    throw error;
  }
}

