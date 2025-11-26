import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateUniqueId } from "@/app/controllers/processRequest";
import type { ToolCategory } from "@/lib/credits/types";

/**
 * POST /api/examples/ably/start
 *
 * Starts a demo process to demonstrate the real-time webhook flow.
 * Creates a process ID and stores it in MongoDB with "processing" status.
 * 
 * Now includes atomic credit deduction - credits are deducted before
 * the process starts, and refunded if the process fails.
 *
 * In a real application, this would also trigger an external API call
 * with a webhook URL for completion notification.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      toolName = "demo-tool", 
      category = "image" as ToolCategory, 
      creditsToDeduct = 1, // Demo uses 1 credit
      data = {} 
    } = body;

    // Generate a unique process ID with atomic credit deduction
    const result = await generateUniqueId({
      userId,
      creditsToDeduct,
      category: category as ToolCategory,
      toolName,
      data: {
        ...data,
        startedAt: new Date().toISOString(),
      },
    });

    // Handle credit/process creation errors
    if (!result.success) {
      const statusCode = result.error === "INSUFFICIENT_CREDITS" ? 402 : 500;
      return NextResponse.json(
        { 
          error: result.error,
          message: result.message,
          availableCredits: result.availableCredits,
        },
        { status: statusCode }
      );
    }

    const { processId } = result;

    // In a real scenario, you would now call an external API:
    // await fetch("https://external-api.com/process", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     ...data,
    //     webhook_url: `${process.env.NEXT_PUBLIC_URL}/api/examples/ably/webhook?processId=${processId}`,
    //   }),
    // });

    return NextResponse.json({
      processId,
      message: "Process started successfully",
      creditsUsed: creditsToDeduct,
      // For demo purposes, include the webhook URL that would be used
      webhookUrl: `/api/examples/ably/webhook?processId=${processId}`,
    });
  } catch (error) {
    console.error("[Demo Start] Error starting process:", error);

    return NextResponse.json(
      { error: "Failed to start process" },
      { status: 500 }
    );
  }
}
