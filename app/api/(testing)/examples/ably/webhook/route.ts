import { NextRequest, NextResponse } from "next/server";
import { updateProcessData } from "@/app/controllers/updateProcessData";

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
 * The updateProcessData function:
 * 1. Updates MongoDB with the result
 * 2. Publishes to Ably channel for real-time notification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { processId, success = true, delay = 0 } = body;

    // Get processId from query params (as external webhooks typically do)
    // or from body (for our demo purposes)
    const finalProcessId =
      req.nextUrl.searchParams.get("processId") || processId;

    if (!finalProcessId) {
      return NextResponse.json(
        { error: "Process ID is required" },
        { status: 400 }
      );
    }

    // Simulate processing delay if specified
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    if (success) {
      // Simulate successful completion with demo data
      await updateProcessData(
        finalProcessId,
        {
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
        },
        "completed"
      );

      return NextResponse.json({
        ok: true,
        message: "Process completed successfully",
        processId: finalProcessId,
      });
    } else {
      // Simulate failure
      await updateProcessData(
        finalProcessId,
        {
          error: "Simulated processing failure - external API returned an error",
          failedAt: new Date().toISOString(),
        },
        "failed"
      );

      return NextResponse.json({
        ok: true,
        message: "Process failed (simulated)",
        processId: finalProcessId,
      });
    }
  } catch (error) {
    console.error("[Demo Webhook] Error processing webhook:", error);

    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

