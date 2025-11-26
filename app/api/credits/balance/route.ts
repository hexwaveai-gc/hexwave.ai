/**
 * GET /api/credits/balance
 * 
 * Fetches user's current credit balance.
 * Requires userId as query parameter.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import User from "@/app/models/User/user.model";

export async function GET(request: NextRequest) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get userId from query params or use authenticated user
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || authUserId;

    // Security: Users can only fetch their own credits
    if (userId !== authUserId) {
      return NextResponse.json(
        { error: "Forbidden - Cannot access other user's credits" },
        { status: 403 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId)
      .select("availableBalance")
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId,
      availableBalance: user.availableBalance || 0,
    });
  } catch (error) {
    console.error("[Credits Balance] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}

