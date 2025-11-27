import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ProcessJobService } from "@/lib/services/ProcessJobService";
import { ApiResponse } from "@/utils/api-response/response";
import { logError } from "@/lib/logger";

/**
 * GET /api/process/[processId]
 * 
 * Fetches the current status and data of a job by its ID.
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

    const { processId: jobId } = await params;

    if (!jobId) {
      return ApiResponse.badRequest("Job ID is required");
    }

    const job = await ProcessJobService.getJob(jobId);

    if (!job) {
      return ApiResponse.notFound("Job not found");
    }

    // Verify user owns this job
    if (job.userId !== userId) {
      return ApiResponse.forbidden("Access denied");
    }

    // Return the job data in a consistent format
    return ApiResponse.ok({
      jobId: job.jobId,
      status: job.status,
      category: job.category,
      toolId: job.toolId,
      toolName: job.toolName,
      progress: job.progress,
      response: job.response,
      credits: {
        charged: job.credits.charged,
        refunded: job.credits.refunded,
      },
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    });
  } catch (error) {
    logError("Error fetching job", error);
    return ApiResponse.serverError("Failed to fetch job status");
  }
}

