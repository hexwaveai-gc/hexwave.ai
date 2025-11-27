/**
 * GET /api/credits/transactions
 * 
 * Fetches user's credit transaction history.
 * Supports filtering and pagination.
 */

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import CreditTransaction from "@/app/models/CreditTransaction/creditTransaction.model";
import { ApiResponse } from "@/utils/api-response/response";
import { logError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
      return ApiResponse.unauthorized();
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || authUserId;

    // Security: Users can only fetch their own transactions
    if (userId !== authUserId) {
      return ApiResponse.error(
        "FORBIDDEN",
        "Cannot access other user's transactions",
        403
      );
    }

    // Parse query parameters
    const type = searchParams.get("type") as "DEDUCTION" | "REFUND" | "CREDIT_ADDED" | null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    await dbConnect();

    // Build query
    const query: Record<string, unknown> = { userId };

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
      CreditTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CreditTransaction.countDocuments(query),
    ]);

    return ApiResponse.ok({
      transactions,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (error) {
    logError("Credit transactions error", error);
    return ApiResponse.serverError("Failed to fetch transactions");
  }
}

