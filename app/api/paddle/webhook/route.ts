import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PADDLE_CONFIG, WEBHOOK_EVENTS } from "@/lib/paddle/config";
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionCanceled,
  handleSubscriptionActivated,
  handleSubscriptionPaused,
  handleSubscriptionResumed,
  handleTransactionCompleted,
  handleTransactionPaymentFailed,
} from "@/lib/paddle/webhook-handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Paddle webhook signature header
const PADDLE_SIGNATURE_HEADER = "paddle-signature";

/**
 * Verify Paddle webhook signature
 * @see https://developer.paddle.com/webhooks/signature-verification
 */
function verifyPaddleSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Parse the signature header
    // Format: ts=timestamp;h1=hash
    const parts = signature.split(";");
    const tsMatch = parts.find((p) => p.startsWith("ts="));
    const h1Match = parts.find((p) => p.startsWith("h1="));

    if (!tsMatch || !h1Match) {
      console.error("[Webhook] Invalid signature format");
      return false;
    }

    const timestamp = tsMatch.replace("ts=", "");
    const providedHash = h1Match.replace("h1=", "");

    // Build the signed payload
    const signedPayload = `${timestamp}:${rawBody}`;

    // Compute HMAC
    const computedHash = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    // Compare signatures
    const isValid = crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(providedHash)
    );

    // Check timestamp to prevent replay attacks (5 minute window)
    const timestampNum = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(currentTime - timestampNum);

    if (timeDiff > 300) {
      console.error("[Webhook] Timestamp too old or in future");
      return false;
    }

    return isValid;
  } catch (error) {
    console.error("[Webhook] Signature verification error:", error);
    return false;
  }
}

/**
 * POST /api/paddle/webhook
 * Handle incoming Paddle webhook events
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Get raw body for signature verification
    const rawBody = await req.text();

    // Get signature header
    const signature = req.headers.get(PADDLE_SIGNATURE_HEADER);

    if (!signature) {
      console.error("[Webhook] Missing signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    // Verify webhook secret is configured
    if (!PADDLE_CONFIG.webhookSecret) {
      console.error("[Webhook] Webhook secret not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Verify signature
    const isValid = verifyPaddleSignature(
      rawBody,
      signature,
      PADDLE_CONFIG.webhookSecret
    );

    if (!isValid) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.event_type;
    const data = payload.data;
    const eventId = payload.event_id;

    console.log(`[Webhook] Received event: ${eventType} (${eventId})`);

    // Route to appropriate handler
    switch (eventType) {
      case WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(data);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(data);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_CANCELED:
        await handleSubscriptionCanceled(data);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_ACTIVATED:
        await handleSubscriptionActivated(data);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_PAUSED:
        await handleSubscriptionPaused(data);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_RESUMED:
        await handleSubscriptionResumed(data);
        break;

      case WEBHOOK_EVENTS.TRANSACTION_COMPLETED:
        await handleTransactionCompleted(data);
        break;

      case WEBHOOK_EVENTS.TRANSACTION_PAYMENT_FAILED:
        await handleTransactionPaymentFailed(data);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[Webhook] Event ${eventType} processed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      event: eventType,
      duration: `${duration}ms`,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Webhook] Error processing webhook:`, error);

    // Return 200 to prevent Paddle from retrying for non-retryable errors
    // Return 500 for retryable errors
    const isRetryable = error instanceof Error && 
      (error.message.includes("User not found") || 
       error.message.includes("Database"));

    if (isRetryable) {
      return NextResponse.json(
        {
          error: "Processing failed",
          message: error instanceof Error ? error.message : "Unknown error",
          duration: `${duration}ms`,
        },
        { status: 500 }
      );
    }

    // For non-retryable errors, return 200 to acknowledge receipt
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration}ms`,
    });
  }
}

/**
 * GET /api/paddle/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    configured: !!PADDLE_CONFIG.webhookSecret,
    environment: PADDLE_CONFIG.environment,
  });
}

