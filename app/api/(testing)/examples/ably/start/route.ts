import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ProcessJobService } from "@/lib/services/ProcessJobService";
import { ApiResponse } from "@/utils/api-response/response";
import { logError } from "@/lib/logger";
import type { ToolCategory } from "@/app/models/ProcessJob/process-job.model";

/**
 * POST /api/examples/ably/start
 *
 * Starts a demo process to demonstrate the real-time webhook flow.
 * Creates a job with atomic credit deduction using ProcessJobService.
 * 
 * Credits are deducted before the process starts, and automatically
 * refunded if the process fails.
 *
 * In a real application, this would also trigger an external API call
 * with a webhook URL for completion notification.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return ApiResponse.unauthorized("Please sign in");
    }

    const body = await req.json();
    const { 
      toolName = "demo-tool", 
      toolId = "demo-tool",
      category = "image" as ToolCategory, 
      credits = 10,
      params = {} 
    } = body;

    // Create job with atomic credit deduction via ProcessJobService
    const result = await ProcessJobService.createJob({
      userId,
      credits,
      category,
      toolId,
      toolName,
      params: {
        ...params,
        startedAt: new Date().toISOString(),
      },
    });

    // Handle credit/job creation errors
    if (!result.success) {
      const statusCode = result.errorCode === "INSUFFICIENT_CREDITS" ? 402 : 500;
      return ApiResponse.error(
        result.errorCode || "JOB_CREATION_FAILED",
        result.error || "Failed to create job",
        statusCode,
        { availableCredits: result.availableCredits }
      );
    }

    const { jobId } = result;

    // In a real scenario, you would now call an external API:
    // await fetch("https://external-api.com/process", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     ...params,
    //     webhook_url: `${process.env.NEXT_PUBLIC_URL}/api/examples/ably/webhook?jobId=${jobId}`,
    //   }),
    // });

    return ApiResponse.ok({
      jobId,
      message: "Job started successfully",
      creditsUsed: credits,
      // For demo purposes, include the webhook URL that would be used
      webhookUrl: `/api/examples/ably/webhook?jobId=${jobId}`,
    });
  } catch (error) {
    logError("[Demo Start] Error starting process", error);
    return ApiResponse.serverError("Failed to start process");
  }
}
