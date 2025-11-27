import { NextRequest } from "next/server";
import { ProcessJobService } from "@/lib/services/ProcessJobService";
import { ApiResponse } from "@/utils/api-response/response";
import { logError, logInfo } from "@/lib/logger";

/**
 * POST /api/examples/ably/webhook
 *
 * Simulates a webhook callback from an external API.
 * This demonstrates what happens when an external service
 * completes processing and notifies your application.
 *
 * In production, this would be the actual webhook endpoint
 * that external APIs call when they finish processing.
 *
 * ProcessJobService handles:
 * 1. Updates MongoDB with the result
 * 2. Publishes to Ably channel for real-time notification
 * 3. Automatic credit refund on failure
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, success = true, delay = 0 } = body;

    // Get jobId from query params (as external webhooks typically do)
    // or from body (for our demo purposes)
    const finalJobId =
      req.nextUrl.searchParams.get("jobId") || 
      req.nextUrl.searchParams.get("processId") || // Backwards compat
      jobId;

    if (!finalJobId) {
      return ApiResponse.badRequest("Job ID is required");
    }

    // Simulate processing delay if specified
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    if (success) {
      // Simulate successful completion with demo data
      const result = await ProcessJobService.completeJob(finalJobId, {
        generations: [
          "https://picsum.photos/seed/demo1/512/512",
          "https://picsum.photos/seed/demo2/512/512",
          "https://picsum.photos/seed/demo3/512/512",
        ],
        metadata: {
          processingTime: `${(Math.random() * 5 + 1).toFixed(2)}s`,
          model: "demo-model-v1",
          completedAt: new Date().toISOString(),
        },
      }, "webhook");

      if (!result.success) {
        return ApiResponse.error(
          "UPDATE_FAILED",
          result.error || "Failed to complete job",
          500
        );
      }

      logInfo("[Demo Webhook] Job completed successfully", { jobId: finalJobId });

      return ApiResponse.ok({
        ok: true,
        message: "Job completed successfully",
        jobId: finalJobId,
      });
    } else {
      // Simulate failure - credits will be automatically refunded
      const result = await ProcessJobService.failJob(
        finalJobId,
        "Simulated processing failure - external API returned an error",
        "EXTERNAL_API_ERROR",
        "webhook"
      );

      if (!result.success) {
        return ApiResponse.error(
          "UPDATE_FAILED",
          result.error || "Failed to update job",
          500
        );
      }

      logInfo("[Demo Webhook] Job failed (simulated)", { 
        jobId: finalJobId,
        refunded: result.refunded,
        refundAmount: result.refundAmount,
      });

      return ApiResponse.ok({
        ok: true,
        message: "Job failed (simulated)",
        jobId: finalJobId,
        refunded: result.refunded,
        refundAmount: result.refundAmount,
      });
    }
  } catch (error) {
    logError("[Demo Webhook] Error processing webhook", error);
    return ApiResponse.serverError("Failed to process webhook");
  }
}

