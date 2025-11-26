import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateUniqueId } from "@/app/controllers/processRequest";

/**
 * POST /api/examples/ably/start
 *
 * Starts a demo process to demonstrate the real-time webhook flow.
 * Creates a process ID and stores it in MongoDB with "processing" status.
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
    const { toolName = "demo-tool", category = "demo", data = {} } = body;

    // Generate a unique process ID and store initial data
    const processId = await generateUniqueId({
      userId,
      toolName,
      category,
      ...data,
      // In a real app, you might also store:
      // webhookUrl: `${process.env.NEXT_PUBLIC_URL}/api/webhook/${toolName}?processId=${processId}`,
      startedAt: new Date().toISOString(),
    });

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

