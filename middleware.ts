import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v7 as uuidv7 } from 'uuid';

// NOTE: Edge Middleware bundles must stay < 1 MB. Keep imports lightweight.

/**
 * Generate a unique trace ID for request tracking
 * This is a lightweight version for edge runtime (no node:crypto)
 */
function generateTraceId(): string {
  return uuidv7();
}

/**
 * Enhanced middleware that adds request tracing
 * Generates trace ID for each request and includes it in response headers
 */
export default clerkMiddleware((auth, req: NextRequest) => {
  // Get trace ID from request header or generate new one
  const traceId = req.headers.get('x-trace-id') || generateTraceId();
  
  // Create response and add trace ID header
  const response = NextResponse.next();
  response.headers.set('x-trace-id', traceId);
  
  // Also add CORS headers for API routes to allow client to read trace ID
  if (req.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Expose-Headers', 'x-trace-id');
  }
  
  return response;
});

// Middleware matcher configuration
export const config = {
  matcher: [
    // Match all routes except files with extensions (e.g., .png, .css) and Next.js internals
    "/((?!.*\\..*|_next).*)", // Exclude files with extensions and _next folder
    "/", // Match the root route explicitly
    "/(api|trpc)(.*)", // Match API and TRPC routes
  ],
};