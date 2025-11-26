import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProcessData } from "@/app/controllers/updateProcessData";

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
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { processId } = await params;

    if (!processId) {
      return NextResponse.json(
        { error: "Process ID is required" },
        { status: 400 }
      );
    }

    const processData = await getProcessData(processId);

    if (!processData) {
      return NextResponse.json(
        { error: "Process not found" },
        { status: 404 }
      );
    }

    // Return the process data in a consistent format
    return NextResponse.json({
      processId: processData.processId,
      status: processData.status,
      data: processData.data || null,
      createdAt: processData.createdAt,
      updatedAt: processData.updatedAt,
    });
  } catch (error) {
    console.error("[Process API] Error fetching process:", error);

    return NextResponse.json(
      { error: "Failed to fetch process status" },
      { status: 500 }
    );
  }
}

