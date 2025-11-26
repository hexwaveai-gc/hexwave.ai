/**
 * Billing API Functions
 * 
 * API functions for billing and subscription management.
 */

import api from "./client";

// ============================================================================
// Types
// ============================================================================

export interface BillingTransaction {
  id: string;
  date: string;
  amount: string;
  currency: string;
  status: string;
  description: string;
  invoice_url?: string;
}

export interface BillingSubscription {
  id: string;
  status: string;
  plan_name: string;
  plan_tier: string;
  billing_cycle: string;
  credits_per_period: number;
  current_period_start: string;
  current_period_ends: string;
  next_payment_date?: string;
  next_payment_amount?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  started_at?: string;
  customer_id?: string;
}

export interface BillingData {
  subscription: BillingSubscription | null;
  transactions: BillingTransaction[];
  customer_portal_url?: string;
}

export interface BillingPortalResponse {
  success: boolean;
  url?: string;
  type?: string;
  message?: string;
  error?: string;
  subscription_id?: string;
}

export interface BillingActionResponse {
  success: boolean;
  message: string;
}

export type BillingAction = "cancel" | "cancel_immediately" | "pause" | "resume" | "reactivate";

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch billing details including subscription and transactions
 */
export async function fetchBilling(): Promise<BillingData> {
  return api.get<BillingData>("/api/billing");
}

/**
 * Perform billing action (cancel, pause, resume, etc.)
 */
export async function performBillingAction(action: BillingAction): Promise<BillingActionResponse> {
  return api.post<BillingActionResponse>("/api/billing", { action });
}

/**
 * Get customer portal URL for payment method updates
 */
export async function getPortalUrl(): Promise<BillingPortalResponse> {
  return api.get<BillingPortalResponse>("/api/billing/portal");
}

