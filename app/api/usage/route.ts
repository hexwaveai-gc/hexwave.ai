/**
 * /api/usage - Credit Usage History API
 * 
 * Returns paginated credit ledger entries with filtering and sorting.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import CreditLedger, { 
  type CreditTransactionType, 
  type CreditTransactionStatus,
  type CreditSource 
} from "@/app/models/CreditLedger/credit-ledger.model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Valid sort fields
const VALID_SORT_FIELDS = ["createdAt", "amount", "balance_after"] as const;
type SortField = typeof VALID_SORT_FIELDS[number];

// Valid transaction types for filtering
const VALID_TYPES: CreditTransactionType[] = [
  "subscription_credit",
  "subscription_renewal",
  "addon_purchase",
  "usage_deduction",
  "refund",
  "manual_adjustment",
  "bonus",
  "expiry",
  "rollback",
  "sync_adjustment",
];

interface UsageQuery {
  page?: number;
  limit?: number;
  type?: CreditTransactionType | CreditTransactionType[];
  status?: CreditTransactionStatus;
  source?: CreditSource;
  startDate?: string;
  endDate?: string;
  sortBy?: SortField;
  sortOrder?: "asc" | "desc";
  search?: string;
  direction?: "credit" | "debit" | "all";
}

interface UsageResponse {
  entries: Array<{
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
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  summary: {
    total_credited: number;
    total_debited: number;
    net_change: number;
    transaction_count: number;
  };
}

/**
 * GET /api/usage
 * Get credit usage history with filtering, sorting, and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const query: UsageQuery = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: Math.min(parseInt(searchParams.get("limit") || "20"), 100),
      type: searchParams.get("type") as CreditTransactionType || undefined,
      status: searchParams.get("status") as CreditTransactionStatus || undefined,
      source: searchParams.get("source") as CreditSource || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      sortBy: (searchParams.get("sortBy") as SortField) || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      search: searchParams.get("search") || undefined,
      direction: (searchParams.get("direction") as "credit" | "debit" | "all") || "all",
    };

    // Handle multiple types from comma-separated string
    const typesParam = searchParams.get("types");
    if (typesParam) {
      query.type = typesParam.split(",").filter(t => 
        VALID_TYPES.includes(t as CreditTransactionType)
      ) as CreditTransactionType[];
    }

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      user_id: userId,
    };

    // Type filter
    if (query.type) {
      if (Array.isArray(query.type)) {
        filter.type = { $in: query.type };
      } else if (VALID_TYPES.includes(query.type)) {
        filter.type = query.type;
      }
    }

    // Status filter
    if (query.status) {
      filter.status = query.status;
    }

    // Source filter
    if (query.source) {
      filter.source = query.source;
    }

    // Direction filter (credit/debit)
    if (query.direction === "credit") {
      filter.amount = { $gt: 0 };
    } else if (query.direction === "debit") {
      filter.amount = { $lt: 0 };
    }

    // Date range filter
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) {
        filter.createdAt.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        // Add 1 day to include the end date fully
        const endDate = new Date(query.endDate);
        endDate.setDate(endDate.getDate() + 1);
        filter.createdAt.$lte = endDate;
      }
    }

    // Search filter (search in description)
    if (query.search) {
      filter.description = { $regex: query.search, $options: "i" };
    }

    // Validate sort field
    const sortField = VALID_SORT_FIELDS.includes(query.sortBy!) 
      ? query.sortBy 
      : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    // Get total count
    const total = await CreditLedger.countDocuments(filter);

    // Calculate pagination
    const page = Math.max(1, query.page!);
    const limit = Math.max(1, Math.min(100, query.limit!));
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Fetch entries
    const entries = await CreditLedger.find(filter)
      .sort({ [sortField!]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate summary for the filtered results (without pagination)
    const summaryAggregation = await CreditLedger.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total_credited: {
            $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] }
          },
          total_debited: {
            $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] }
          },
          net_change: { $sum: "$amount" },
          transaction_count: { $sum: 1 },
        },
      },
    ]);

    const summary = summaryAggregation[0] || {
      total_credited: 0,
      total_debited: 0,
      net_change: 0,
      transaction_count: 0,
    };

    // Format response
    const response: UsageResponse = {
      entries: entries.map((entry) => ({
        id: entry._id.toString(),
        transaction_ref: entry.transaction_ref,
        type: entry.type,
        amount: entry.amount,
        balance_before: entry.balance_before,
        balance_after: entry.balance_after,
        status: entry.status,
        source: entry.source,
        description: entry.description,
        usage_details: entry.usage_details,
        created_at: entry.createdAt?.toISOString() || new Date().toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      summary: {
        total_credited: summary.total_credited || 0,
        total_debited: summary.total_debited || 0,
        net_change: summary.net_change || 0,
        transaction_count: summary.transaction_count || 0,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("[Usage] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/usage/summary
 * Get usage summary for dashboard
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { days = 30 } = body;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily usage aggregation
    const dailyUsage = await CreditLedger.aggregate([
      {
        $match: {
          user_id: userId,
          status: "completed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          credited: {
            $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] },
          },
          debited: {
            $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] },
          },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // By type aggregation
    const byType = await CreditLedger.aggregate([
      {
        $match: {
          user_id: userId,
          status: "completed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Total summary
    const totalSummary = await CreditLedger.aggregate([
      {
        $match: {
          user_id: userId,
          status: "completed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total_credited: {
            $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] },
          },
          total_debited: {
            $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] },
          },
          transactions: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      daily_usage: dailyUsage.map((d) => ({
        date: d._id,
        credited: d.credited,
        debited: d.debited,
        transactions: d.transactions,
      })),
      by_type: byType.reduce((acc, t) => {
        acc[t._id] = { total: t.total, count: t.count };
        return acc;
      }, {} as Record<string, { total: number; count: number }>),
      summary: totalSummary[0] || {
        total_credited: 0,
        total_debited: 0,
        transactions: 0,
      },
      period_days: days,
    });

  } catch (error) {
    console.error("[Usage Summary] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

