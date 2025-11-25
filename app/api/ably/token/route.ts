import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateAblyTokenRequest } from "@/lib/ably";

/**
 * GET /api/ably/token
 * Generates an Ably token for authenticated users
 * Used by frontend to establish real-time connections
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const tokenRequest = await generateAblyTokenRequest(userId);

    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error("[Ably Token] Error generating token:", error);

    return NextResponse.json(
      { error: "Failed to generate Ably token" },
      { status: 500 }
    );
  }
}
