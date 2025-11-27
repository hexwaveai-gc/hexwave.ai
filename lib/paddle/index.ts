/**
 * Paddle Integration Module
 * 
 * Central export point for all Paddle-related functionality.
 */

// Configuration (includes both constants and server-side config)
export {
  // Constants
  PADDLE_PRODUCTS,
  PADDLE_PRICES,
  PLAN_CREDITS,
  PLAN_PRICING,
  MONTHLY_CREDITS,
  PRODUCT_TO_TIER,
  WEBHOOK_EVENTS,
  PADDLE_STATUS_MAP,
  // Server config
  PADDLE_CONFIG,
  validatePaddleConfig,
  getCheckoutUrls,
  // Helper functions
  getCreditsForPrice,
  getPlanNameFromPriceId,
  getProductIdFromPriceId,
  isAnnualBilling,
  getBillingCycle,
} from "./config";

// API Client
export {
  getPaddleClient,
  generateCheckoutUrl,
  getSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  updateSubscription,
  getCustomer,
  getTransaction,
  createAddonTransaction,
} from "./client";

// Credit Service
export {
  CreditService,
  addCredits,
  deductCredits,
  refundCredits,
  getBalance,
  validateBalance,
  verifyBalance,
  syncFromPaddle,
  getUsageSummary,
  getTransactionHistory,
  type CreditOperationResult,
  type AddCreditsInput,
  type DeductCreditsInput,
  type RefundCreditsInput,
} from "@/lib/services/CreditService";

// Webhook Handlers
export {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionCanceled,
  handleSubscriptionActivated,
  handleSubscriptionPaused,
  handleSubscriptionResumed,
  handleTransactionCompleted,
  handleTransactionPaymentFailed,
} from "./webhook-handlers";
