/**
 * Usage API Functions
 * 
 * API functions for credit usage history.
 */

import api from "./client";

// ============================================================================
// Types
// ============================================================================

export interface UsageEntry {
  id: string;
  transaction_ref: string;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  status: string;
  source: string;
  description: string;
  usage_details?: {
    operation_type?: string;
    model_id?: string;
    quality?: string;
    generation_id?: string;
  };
  created_at: string;
}

export interface UsagePagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UsageSummary {
  total_credited: number;
  total_debited: number;
  net_change: number;
  transaction_count: number;
}

export interface UsageData {
  entries: UsageEntry[];
  pagination: UsagePagination;
  summary: UsageSummary;
}

export interface UsageFilters {
  page?: number;
  limit?: number;
  type?: string;
  types?: string;
  direction?: "all" | "credit" | "debit";
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "createdAt" | "amount" | "balance_after";
  sortOrder?: "asc" | "desc";
}

export interface UsageDailySummary {
  daily_usage: Array<{
    date: string;
    credited: number;
    debited: number;
    transactions: number;
  }>;
  by_type: Record<string, { total: number; count: number }>;
  summary: {
    total_credited: number;
    total_debited: number;
    transactions: number;
  };
  period_days: number;
}

// ============================================================================
// Types for API Response Wrapper
// ============================================================================

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch usage history with filters and pagination
 */
export async function fetchUsage(filters: UsageFilters = {}): Promise<UsageData> {
  const params: Record<string, string | number | undefined> = {
    page: filters.page,
    limit: filters.limit,
    type: filters.type,
    types: filters.types,
    direction: filters.direction !== "all" ? filters.direction : undefined,
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    search: filters.search,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };

  const response = await api.get<ApiSuccessResponse<UsageData>>("/api/usage", params);
  return response.data;
}

/**
 * Fetch usage summary for dashboard charts
 */
export async function fetchUsageSummary(days: number = 30): Promise<UsageDailySummary> {
  const response = await api.post<ApiSuccessResponse<UsageDailySummary>>("/api/usage", { days });
  return response.data;
}

