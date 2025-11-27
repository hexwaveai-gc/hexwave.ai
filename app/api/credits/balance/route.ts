/**
 * GET /api/credits/balance
 *
 * Fetches user's current credit balance.
 * Requires userId as query parameter.
 */

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import User from "@/app/models/User/user.model";
import { ApiResponse } from "@/utils/api-response/response";
import { logError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
      return ApiResponse.unauthorized();
    }

    // Get userId from query params or use authenticated user
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || authUserId;

    // Security: Users can only fetch their own credits
    if (userId !== authUserId) {
      return ApiResponse.error(
        "FORBIDDEN",
        "Cannot access other user's credits",
        403
      );
    }

    await dbConnect();

    const user = await User.findById(userId)
      .select("credits balance_verified_at")
      .lean();

    if (!user) {
      return ApiResponse.notFound("User not found");
    }

    return ApiResponse.ok({
      userId,
      credits: user.credits || 0,
      balanceVerified: !!user.balance_verified_at,
    });
  } catch (error) {
    logError("Credits balance error", error);
    return ApiResponse.serverError("Failed to fetch credits");
  }
}
