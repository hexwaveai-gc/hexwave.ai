/**
 * Auth Middleware - Main Entry Point
 * 
 * Provides a clean, DRY way to protect API routes with:
 * - Clerk authentication
 * - Upstash rate limiting
 * - Credit validation
 * - Subscription checks
 * - Plan tier validation
 * - **Automatic logging context** (traceId, userId, path auto-included in all logs)
 * 
 * NOTE: This module is SERVER-ONLY. It cannot be imported in client components.
 * 
 * @example Basic usage
 * ```typescript
 * import { withAuth } from "@/lib/api/auth-middleware";
 * import { logInfo } from "@/lib/logger"; // Context is automatic!
 * 
 * export const POST = withAuth(
 *   async (request, context) => {
 *     logInfo("Processing started"); // Automatically includes traceId, userId, path!
 *     return NextResponse.json({ success: true });
 *   },
 *   { requiredCredits: 10 }
 * );
 * ```
 */

// This ensures the auth middleware is only used on the server
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import {
  authMiddleware,
  createErrorResponse,
  PROTECTION_PRESETS,
  incrementFreeTierUsage,
  FREE_TIER_LIMITS,
} from "./middleware";
import {
  runWithContextAsync,
  createRequestContext,
  logError,
  logRequestStart,
  logRequestEnd,
  getTraceId,
} from "@/lib/logger";
import type {
  AuthMiddlewareOptions,
  AuthContext,
  ProtectionPreset,
  AuthMiddlewareResult,
  AuthenticatedRouteHandler,
  AuthErrorResponse,
} from "./types";

// =============================================================================
// RE-EXPORTS
// =============================================================================

export {
  authMiddleware,
  createErrorResponse,
  incrementFreeTierUsage,
  getFreeTierUsage,
  PROTECTION_PRESETS,
  FREE_TIER_LIMITS,
} from "./middleware";

export type {
  AuthMiddlewareOptions,
  AuthContext,
  AuthMiddlewareResult,
  AuthMiddlewareSuccess,
  AuthMiddlewareError,
  AuthErrorType,
  AuthErrorResponse,
  PlanTier,
  FreeTierLimits,
  ProtectionPreset,
  AuthenticatedRouteHandler,
  ValidationResult,
  GenerationCategory,
} from "./types";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract useful headers from request
 */
function getRequestHeaders(request: NextRequest): {
  userAgent: string | null;
  ip: string | null;
} {
  return {
    userAgent: request.headers.get("user-agent"),
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      null,
  };
}

// =============================================================================
// WRAPPER FUNCTION
// =============================================================================

/**
 * Higher-order function that wraps an API route handler with authentication middleware
 * 
 * **Automatically sets up logging context!** All `logInfo`, `logError`, etc. calls
 * within the handler will automatically include traceId, userId, path, method.
 * 
 * @param handler - The route handler function that receives (request, authContext)
 * @param optionsOrPreset - Either middleware options object or a preset name
 * @returns Wrapped handler function compatible with Next.js App Router
 * 
 * @example Using with options
 * ```typescript
 * import { logInfo, logError } from "@/lib/logger";
 * 
 * export const POST = withAuth(
 *   async (request, context) => {
 *     logInfo("Processing started"); // Auto-includes traceId, userId, path!
 *     
 *     try {
 *       // Your logic
 *       logInfo("Success", { generatedImages: 2 });
 *     } catch (error) {
 *       logError("Failed", error); // Auto-includes context + error details
 *     }
 *     
 *     return NextResponse.json({ data });
 *   },
 *   { requiredCredits: 10 }
 * );
 * ```
 */
export function withAuth<T>(
  handler: AuthenticatedRouteHandler<T>,
  optionsOrPreset: AuthMiddlewareOptions | ProtectionPreset = {}
): (request: NextRequest) => Promise<NextResponse | T> {
  // Resolve options from preset if string provided
  const options: AuthMiddlewareOptions =
    typeof optionsOrPreset === "string"
      ? PROTECTION_PRESETS[optionsOrPreset]
      : optionsOrPreset;

  return async (request: NextRequest): Promise<NextResponse | T> => {
    // Extract request info for logging context
    const { userAgent, ip } = getRequestHeaders(request);
    const path = request.nextUrl.pathname;
    const method = request.method;

    // Create initial logging context (before auth - no userId yet)
    const initialContext = createRequestContext({
      path,
      method,
      userAgent,
      ip,
    });

    // Run everything within the logging context
    return runWithContextAsync(initialContext, async () => {
      // Run authentication middleware
      const result = await authMiddleware(request, options);

      // Handle rate limit analytics (fire and forget)
      if (result.pending) {
        waitUntil(result.pending);
      }

      // Handle authentication/authorization failure
      if (!result.success) {
        logRequestEnd(result.statusCode, { error: result.error });
        return createErrorResponse(result);
      }

      // Update context with user info (now we have userId, planTier, etc.)
      const fullContext = createRequestContext({
        userId: result.context.userId,
        path,
        method,
        userAgent,
        ip,
        planTier: result.context.planTier,
        isFreeTier: result.context.isFreeTier,
      });

      // Run handler with full context
      return runWithContextAsync(fullContext, async () => {
        // Log request start with full details
        logRequestStart({
          trialDaysRemaining: result.context.trialDaysRemaining,
          credits: result.context.credits,
        });

        // Update auth context with traceId
        const contextWithTraceId: AuthContext = {
          ...result.context,
          traceId: getTraceId() || result.context.traceId,
        };

        try {
          const response = await handler(request, contextWithTraceId);

          // If response is NextResponse, add rate limit headers and traceId
          if (response instanceof NextResponse) {
            Object.entries(result.headers).forEach(([key, value]) => {
              response.headers.set(key, value);
            });
            // Add traceId to response for debugging
            const traceId = getTraceId();
            if (traceId) {
              response.headers.set("X-Trace-Id", traceId);
            }
          }

          // Log successful completion
          logRequestEnd(200);

          return response;
        } catch (error) {
          logError("Handler error in withAuth wrapper", error, {
            operation: "route_handler",
          });

          logRequestEnd(500, { error: "INTERNAL_ERROR" });

          const errorResponse: AuthErrorResponse = {
            error: "INTERNAL_ERROR",
            message: error instanceof Error ? error.message : "Internal server error",
          };

          const traceId = getTraceId();
          const headers: Record<string, string> = { ...result.headers };
          if (traceId) {
            headers["X-Trace-Id"] = traceId;
          }

          return NextResponse.json(errorResponse, {
            status: 500,
            headers,
          });
        }
      });
    });
  };
}

// =============================================================================
// SPECIALIZED WRAPPERS
// =============================================================================

/**
 * Options for generation auth wrapper
 */
export interface GenerationAuthOptions extends Partial<AuthMiddlewareOptions> {
  /** Category of generation (image, video, audio) */
  category?: import("./types").GenerationCategory;
  /** Tool/model ID being used */
  toolId?: string;
}

/**
 * Wrapper for generation routes (image, video, audio)
 * Includes credit check, free tier limits, and trial expiry check
 * 
 * **Automatic logging context included!**
 * 
 * @param handler - Route handler
 * @param requiredCredits - Credits required for this operation
 * @param options - Additional options including category and toolId
 * 
 * @example
 * ```typescript
 * import { logInfo, logGeneration } from "@/lib/logger";
 * 
 * export const POST = withGenerationAuth(
 *   async (request, context) => {
 *     logGeneration("started", { tool: "nano-banana" }); // Auto context!
 *     // ...
 *     logGeneration("completed", { tool: "nano-banana" });
 *     return NextResponse.json({ success: true });
 *   },
 *   10, // credits
 *   { category: "image" }
 * );
 * ```
 */
export function withGenerationAuth<T>(
  handler: AuthenticatedRouteHandler<T>,
  requiredCredits: number,
  options: GenerationAuthOptions = {}
): (request: NextRequest) => Promise<NextResponse | T> {
  const { category, toolId, ...additionalOptions } = options;

  return withAuth(handler, {
    ...PROTECTION_PRESETS.generation,
    requiredCredits,
    generationCategory: category,
    toolId,
    ...additionalOptions,
  });
}

/**
 * Wrapper for premium-only routes
 * Requires active subscription
 * 
 * @param handler - Route handler
 * @param additionalOptions - Additional middleware options
 */
export function withPremiumAuth<T>(
  handler: AuthenticatedRouteHandler<T>,
  additionalOptions: Partial<AuthMiddlewareOptions> = {}
): (request: NextRequest) => Promise<NextResponse | T> {
  return withAuth(handler, {
    ...PROTECTION_PRESETS.premium,
    ...additionalOptions,
  });
}

/**
 * Wrapper for admin/enterprise routes
 * Requires enterprise plan
 * 
 * @param handler - Route handler
 * @param additionalOptions - Additional middleware options
 */
export function withAdminAuth<T>(
  handler: AuthenticatedRouteHandler<T>,
  additionalOptions: Partial<AuthMiddlewareOptions> = {}
): (request: NextRequest) => Promise<NextResponse | T> {
  return withAuth(handler, {
    ...PROTECTION_PRESETS.admin,
    ...additionalOptions,
  });
}

/**
 * Wrapper for public routes with rate limiting
 * No authentication required
 * 
 * @param handler - Route handler
 * @param additionalOptions - Additional middleware options
 */
export function withPublicRateLimit<T>(
  handler: AuthenticatedRouteHandler<T>,
  additionalOptions: Partial<AuthMiddlewareOptions> = {}
): (request: NextRequest) => Promise<NextResponse | T> {
  return withAuth(handler, {
    ...PROTECTION_PRESETS.public,
    ...additionalOptions,
  });
}

// =============================================================================
// MANUAL MIDDLEWARE (for complex scenarios)
// =============================================================================

/**
 * Use auth middleware manually when you need more control
 * Note: You'll need to set up logging context manually with runWithContextAsync
 * 
 * @example
 * ```typescript
 * import { runAuthMiddleware, createErrorResponse, incrementFreeTierUsage } from "@/lib/api/auth-middleware";
 * import { runWithContextAsync, createRequestContext, logInfo } from "@/lib/logger";
 * import { waitUntil } from "@vercel/functions";
 * 
 * export async function POST(request: NextRequest) {
 *   const context = createRequestContext({
 *     path: request.nextUrl.pathname,
 *     method: request.method,
 *   });
 *   
 *   return runWithContextAsync(context, async () => {
 *     const result = await runAuthMiddleware(request, { requiredCredits: 10 });
 *     
 *     waitUntil(result.pending);
 *     
 *     if (!result.success) {
 *       return createErrorResponse(result);
 *     }
 *     
 *     logInfo("Processing..."); // Auto-includes traceId, path
 *     
 *     return NextResponse.json({ success: true });
 *   });
 * }
 * ```
 */
export const runAuthMiddleware = authMiddleware;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if middleware result is success
 */
export function isAuthSuccess(
  result: AuthMiddlewareResult
): result is import("./types").AuthMiddlewareSuccess {
  return result.success === true;
}

/**
 * Type guard to check if middleware result is error
 */
export function isAuthError(
  result: AuthMiddlewareResult
): result is import("./types").AuthMiddlewareError {
  return result.success === false;
}

