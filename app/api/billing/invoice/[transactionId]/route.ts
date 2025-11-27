/**
 * /api/billing/invoice/[transactionId] - Invoice Download
 * 
 * Fetches and redirects to Paddle invoice PDF
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import User from "@/app/models/User/user.model";
import { getPaddleClient } from "@/lib/paddle/client";
import { ApiResponse } from "@/utils/api-response/response";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ transactionId: string }>;
}

/**
 * GET /api/billing/invoice/[transactionId]
 * Get invoice PDF URL for a transaction
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized();
    }

    const { transactionId } = await params;

    if (!transactionId) {
      return ApiResponse.badRequest("Transaction ID required");
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user?.customerId) {
      return ApiResponse.notFound("No customer found");
    }

    const paddle = getPaddleClient();

    try {
      // Get the transaction to verify it belongs to this customer
      const transaction = await paddle.transactions.get(transactionId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txData = transaction as any;

      // Verify the transaction belongs to this customer
      if (txData.customerId !== user.customerId) {
        return ApiResponse.notFound("Transaction not found");
      }

      // Get invoice PDF
      const invoice = await paddle.transactions.getInvoicePDF(transactionId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoiceData = invoice as any;

      if (invoiceData.url) {
        // Redirect to the invoice PDF URL
        return NextResponse.redirect(invoiceData.url);
      }

      return ApiResponse.notFound("Invoice not available");

    } catch (error) {
      logError("Error fetching invoice", error, { userId, transactionId });
      return ApiResponse.notFound("Invoice not found");
    }

  } catch (error) {
    logError("Invoice API error", error);
    return ApiResponse.serverError();
  }
}

