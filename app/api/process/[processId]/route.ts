import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProcessData } from "@/app/controllers/updateProcessData";
import { ApiResponse } from "@/utils/api-response/response";
import { logError } from "@/lib/logger";

/**
 * GET /api/process/[processId]
 * 
 * Fetches the current status and data of a process by its ID.
 * Used to:
 * - Get initial state when component mounts
 * - Recover state after page refresh
 * - Provide fallback data if Ably connection fails
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ processId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return ApiResponse.unauthorized("Please sign in");
    }

    const { processId } = await params;

    if (!processId) {
      return ApiResponse.badRequest("Process ID is required");
    }

    const processData = await getProcessData(processId);

    if (!processData) {
      return ApiResponse.notFound("Process not found");
    }

    // Return the process data in a consistent format
    return ApiResponse.ok({
      processId: processData.processId,
      status: processData.status,
      data: processData.data || null,
      createdAt: processData.createdAt,
      updatedAt: processData.updatedAt,
    });
  } catch (error) {
    logError("Error fetching process", error);
    return ApiResponse.serverError("Failed to fetch process status");
  }
}

