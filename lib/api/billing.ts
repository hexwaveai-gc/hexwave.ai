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
  message?: string;
}

export type BillingAction = "cancel" | "cancel_immediately" | "pause" | "resume" | "reactivate";

/**
 * API response wrapper from ApiResponse.ok()
 * The actual data is nested inside { success: true, data: {...} }
 */
interface ApiWrappedResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch billing details including subscription and transactions
 * 
 * Note: API returns wrapped response { success: true, data: {...} }
 */
export async function fetchBilling(): Promise<BillingData> {
  const response = await api.get<ApiWrappedResponse<BillingData>>("/api/billing");
  return response.data || { subscription: null, transactions: [] };
}

/**
 * Perform billing action (cancel, pause, resume, etc.)
 * 
 * Note: API returns wrapped response { success: true, message: "..." }
 */
export async function performBillingAction(action: BillingAction): Promise<BillingActionResponse> {
  const response = await api.post<ApiWrappedResponse<undefined>>("/api/billing", { action });
  return { success: response.success, message: response.message };
}

/**
 * Get customer portal URL for payment method updates
 */
export async function getPortalUrl(): Promise<BillingPortalResponse> {
  const response = await api.get<ApiWrappedResponse<BillingPortalResponse>>("/api/billing/portal");
  return response.data || { success: false };
}

