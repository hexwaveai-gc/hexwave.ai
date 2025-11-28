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
import { logInfo, logError, logWarn, createTimer, logSubscription } from "@/lib/logger";

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
      logWarn("Paddle webhook invalid signature format");
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
      logWarn("Paddle webhook timestamp expired", { timeDiff });
      return false;
    }

    return isValid;
  } catch (error) {
    logError("Paddle webhook signature verification error", error);
    return false;
  }
}

/**
 * POST /api/paddle/webhook
 * Handle incoming Paddle webhook events
 */
export async function POST(req: NextRequest) {
  const timer = createTimer("paddle_webhook");

  try {
    // Get raw body for signature verification
    const rawBody = await req.text();

    // Get signature header
    const signature = req.headers.get(PADDLE_SIGNATURE_HEADER);

    if (!signature) {
      logWarn("Paddle webhook missing signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    // Verify webhook secret is configured
    if (!PADDLE_CONFIG.webhookSecret) {
      logError("Paddle webhook secret not configured");
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
      logWarn("Paddle webhook invalid signature");
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

    logInfo("Paddle webhook received", { eventType, eventId });

    // Route to appropriate handler
    switch (eventType) {
      case WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(data);
        logSubscription("created", { eventId, customerId: data.customer_id });
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(data);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_CANCELED:
        await handleSubscriptionCanceled(data);
        logSubscription("cancelled", { eventId, subscriptionId: data.id });
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_ACTIVATED:
        await handleSubscriptionActivated(data);
        logSubscription("activated", { eventId, subscriptionId: data.id });
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
        logWarn("Paddle webhook unhandled event", { eventType });
    }

    const duration = timer.done({ eventType, eventId });
    logInfo("Paddle webhook processed", { eventType, eventId, duration });

    return NextResponse.json({
      success: true,
      event: eventType,
      duration: `${duration}ms`,
    });

  } catch (error) {
    timer.done({ error: true });
    logError("Paddle webhook processing error", error);

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
        },
        { status: 500 }
      );
    }

    // For non-retryable errors, return 200 to acknowledge receipt
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
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

