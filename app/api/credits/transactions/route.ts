/**
 * GET /api/credits/transactions
 *
 * Fetches user's credit transaction history from CreditLedger.
 * Supports filtering and pagination.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import CreditLedger, {
  type CreditTransactionType,
} from "@/app/models/CreditLedger/credit-ledger.model";

export async function GET(request: NextRequest) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || authUserId;

    // Security: Users can only fetch their own transactions
    if (userId !== authUserId) {
      return NextResponse.json(
        { error: "Forbidden - Cannot access other user's transactions" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const type = searchParams.get("type") as CreditTransactionType | null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      100
    );
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    await dbConnect();

    // Build query
    const query: Record<string, unknown> = { user_id: userId };

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        (query.createdAt as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.createdAt as Record<string, Date>).$lte = new Date(endDate);
      }
    }

    // Execute queries in parallel
    const [transactions, total] = await Promise.all([
      CreditLedger.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CreditLedger.countDocuments(query),
    ]);

    return NextResponse.json({
      transactions,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("[Credit Transactions] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
