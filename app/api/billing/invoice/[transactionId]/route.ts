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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { transactionId } = await params;

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user?.customerId) {
      return NextResponse.json(
        { error: "No customer found" },
        { status: 404 }
      );
    }

    const paddle = getPaddleClient();

    try {
      // Get the transaction to verify it belongs to this customer
      const transaction = await paddle.transactions.get(transactionId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txData = transaction as any;

      // Verify the transaction belongs to this customer
      if (txData.customerId !== user.customerId) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      // Get invoice PDF
      const invoice = await paddle.transactions.getInvoicePDF(transactionId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoiceData = invoice as any;

      if (invoiceData.url) {
        // Redirect to the invoice PDF URL
        return NextResponse.redirect(invoiceData.url);
      }

      return NextResponse.json(
        { error: "Invoice not available" },
        { status: 404 }
      );

    } catch (error) {
      console.error("[Invoice] Error fetching invoice:", error);
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error("[Invoice] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

