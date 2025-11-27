import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateAblyTokenRequest } from "@/lib/ably";
import { ApiResponse } from "@/utils/api-response/response";
import { logError } from "@/lib/logger";

/**
 * GET /api/ably/token
 * Generates an Ably token for authenticated users
 * Used by frontend to establish real-time connections
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return ApiResponse.unauthorized("Please sign in");
    }

    const tokenRequest = await generateAblyTokenRequest(userId);

    return ApiResponse.ok(tokenRequest);
  } catch (error) {
    logError("Error generating Ably token", error);
    return ApiResponse.serverError("Failed to generate Ably token");
  }
}
