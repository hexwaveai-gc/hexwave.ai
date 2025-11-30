/**
 * Production-Grade Logger with Automatic Context Propagation
 * 
 * Uses Node.js AsyncLocalStorage to automatically include request context
 * (traceId, userId, path, method) in ALL logs without explicit passing.
 * 
 * Features:
 * - Automatic context propagation via AsyncLocalStorage
 * - UUIDv7 trace IDs for chronological ordering
 * - Structured JSON logging for production
 * - Pretty printing for development
 * - Just import and use - context is automatic!
 * 
 * NOTE: This module is SERVER-ONLY. It cannot be imported in client components.
 * If you try to import it on the client, you'll get a build error.
 * 
 * @example
 * ```typescript
 * // In any file, just import and use - context is automatic!
 * import { logInfo, logError } from "@/lib/logger";
 * 
 * logInfo("Processing started");
 * // Output: {"traceId":"0190a1b2-c3d4-7e5f-...","userId":"user_123","path":"/api/generate",...,"msg":"Processing started"}
 * 
 * logError("Failed", error);
 * // Automatically includes traceId, userId, path + error details
 * ```
 */

// This ensures the logger is only used on the server
import "server-only";

import pino, { Logger, LoggerOptions } from "pino";
import { AsyncLocalStorage } from "async_hooks";
import { v7 as uuidv7 } from "uuid";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Request context stored in AsyncLocalStorage
 * Automatically included in all logs
 */
export interface RequestContext {
  /** UUIDv7 trace ID - chronologically sortable */
  traceId: string;
  /** Clerk user ID */
  userId?: string;
  /** Request path */
  path?: string;
  /** HTTP method */
  method?: string;
  /** User agent (only logged in first entry) */
  userAgent?: string;
  /** Client IP */
  ip?: string;
  /** Plan tier */
  planTier?: string;
  /** Is free tier user */
  isFreeTier?: boolean;
  /** Request start time */
  startTime?: number;
}

/**
 * Additional log context - merged with request context
 */
export interface LogContext {
  [key: string]: unknown;
}

/**
 * Error context - additional metadata for error logging
 */
export interface ErrorContext extends LogContext {
  errorType?: string;
  stack?: string;
  code?: string;
}

// =============================================================================
// ASYNC LOCAL STORAGE
// =============================================================================

/**
 * AsyncLocalStorage instance for request context
 * This allows context to flow through async operations automatically
 */
const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Get current request context from AsyncLocalStorage
 * Returns undefined if no context is set
 */
export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Run a function within a request context
 * All logs within this function will automatically include the context
 * 
 * @param context - Request context to set
 * @param fn - Function to run with context
 * @returns Result of the function
 */
export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return asyncLocalStorage.run(context, fn);
}

/**
 * Run an async function within a request context
 * All logs within this function will automatically include the context
 * 
 * @param context - Request context to set
 * @param fn - Async function to run with context
 * @returns Promise result of the function
 */
export function runWithContextAsync<T>(
  context: RequestContext,
  fn: () => Promise<T>
): Promise<T> {
  return asyncLocalStorage.run(context, fn);
}

/**
 * Generate a new trace ID using UUIDv7
 * UUIDv7 is time-ordered, making logs chronologically sortable
 */
export function generateTraceId(): string {
  return uuidv7();
}

// =============================================================================
// LOGGER CONFIGURATION
// =============================================================================

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info");

/**
 * Base logger configuration
 */
const baseConfig: LoggerOptions = {
  level: logLevel,
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: "hexwave-api",
    env: process.env.NODE_ENV,
  },
  redact: {
    paths: [
      "password",
      "token",
      "authorization",
      "apiKey",
      "api_key",
      "secret",
      "*.password",
      "*.token",
      "*.apiKey",
      "headers.authorization",
      "headers.cookie",
    ],
    remove: true,
  },
};

/**
 * Development configuration with pretty printing
 */
const devConfig: LoggerOptions = {
  ...baseConfig,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname,service,env",
      messageFormat: "[{traceId}] {msg}",
      singleLine: false,
    },
  },
};

/**
 * Production configuration - JSON output for log aggregation
 */
const prodConfig: LoggerOptions = {
  ...baseConfig,
  formatters: {
    level: (label) => ({ level: label }),
  },
};

/**
 * Base Pino logger instance
 */
const baseLogger: Logger = pino(
  isTest ? { level: "silent" } : isDevelopment ? devConfig : prodConfig
);

// =============================================================================
// SAFE LOGGING WRAPPER
// =============================================================================

/**
 * Safe logging wrapper that catches "worker has exited" errors
 * 
 * In Next.js serverless environments, pino-pretty uses worker threads that can
 * terminate before logging completes. This wrapper catches those errors gracefully.
 */
function safeLog(
  logFn: () => void,
  fallbackFn?: () => void
): void {
  try {
    logFn();
  } catch (error) {
    // Check if this is a worker exit error (common in Next.js serverless)
    if (
      error instanceof Error &&
      error.message.includes("worker has exited")
    ) {
      // Silently ignore - this happens during serverless function shutdown
      // Optionally log to console as fallback in development
      if (isDevelopment && fallbackFn) {
        try {
          fallbackFn();
        } catch {
          // Ignore fallback errors too
        }
      }
      return;
    }
    // Re-throw unexpected errors
    throw error;
  }
}

// =============================================================================
// CONTEXT-AWARE LOGGING FUNCTIONS
// =============================================================================

/**
 * Get context to include in log entry
 * Merges AsyncLocalStorage context with additional context
 */
function getLogContext(additionalContext?: LogContext): LogContext {
  const requestContext = getRequestContext();
  
  if (!requestContext) {
    return additionalContext || {};
  }

  // Core context (always included)
  const coreContext: LogContext = {
    traceId: requestContext.traceId,
  };

  // Include userId if present
  if (requestContext.userId) {
    coreContext.userId = requestContext.userId;
  }

  // Include path if present
  if (requestContext.path) {
    coreContext.path = requestContext.path;
  }

  // Include method if present
  if (requestContext.method) {
    coreContext.method = requestContext.method;
  }

  return {
    ...coreContext,
    ...additionalContext,
  };
}

/**
 * Log info level message
 * Automatically includes traceId, userId, path from request context
 */
export function logInfo(message: string, context?: LogContext): void {
  const fullContext = getLogContext(context);
  safeLog(() => {
    if (Object.keys(fullContext).length > 0) {
      baseLogger.info(fullContext, message);
    } else {
      baseLogger.info(message);
    }
  });
}

/**
 * Log warning level message
 * Automatically includes traceId, userId, path from request context
 */
export function logWarn(message: string, context?: LogContext): void {
  const fullContext = getLogContext(context);
  safeLog(() => {
    if (Object.keys(fullContext).length > 0) {
      baseLogger.warn(fullContext, message);
    } else {
      baseLogger.warn(message);
    }
  });
}

/**
 * Log error level message
 * Automatically includes traceId, userId, path from request context
 */
export function logError(
  message: string,
  error?: unknown,
  context?: ErrorContext
): void {
  const fullContext = getLogContext(context) as ErrorContext;

  safeLog(() => {
    if (error instanceof Error) {
      fullContext.errorType = error.name;
      fullContext.stack = error.stack;
      if ("code" in error) {
        fullContext.code = String(error.code);
      }
      baseLogger.error({ ...fullContext, err: error }, message);
    } else if (error) {
      baseLogger.error({ ...fullContext, error }, message);
    } else if (Object.keys(fullContext).length > 0) {
      baseLogger.error(fullContext, message);
    } else {
      baseLogger.error(message);
    }
  });
}

/**
 * Log debug level message
 * Automatically includes traceId, userId, path from request context
 */
export function logDebug(message: string, context?: LogContext): void {
  const fullContext = getLogContext(context);
  safeLog(() => {
    if (Object.keys(fullContext).length > 0) {
      baseLogger.debug(fullContext, message);
    } else {
      baseLogger.debug(message);
    }
  });
}

/**
 * Log trace level message
 * Automatically includes traceId, userId, path from request context
 */
export function logTrace(message: string, context?: LogContext): void {
  const fullContext = getLogContext(context);
  safeLog(() => {
    if (Object.keys(fullContext).length > 0) {
      baseLogger.trace(fullContext, message);
    } else {
      baseLogger.trace(message);
    }
  });
}

/**
 * Log fatal level message
 * Automatically includes traceId, userId, path from request context
 */
export function logFatal(
  message: string,
  error?: unknown,
  context?: ErrorContext
): void {
  const fullContext = getLogContext(context) as ErrorContext;

  safeLog(() => {
    if (error instanceof Error) {
      fullContext.errorType = error.name;
      fullContext.stack = error.stack;
      baseLogger.fatal({ ...fullContext, err: error }, message);
    } else if (Object.keys(fullContext).length > 0) {
      baseLogger.fatal(fullContext, message);
    } else {
      baseLogger.fatal(message);
    }
  });
}

// =============================================================================
// SPECIALIZED LOGGING FUNCTIONS
// =============================================================================

/**
 * Log the start of a request with full details
 * Call this once at the start - includes userAgent, ip, etc.
 */
export function logRequestStart(additionalContext?: LogContext): void {
  const requestContext = getRequestContext();
  
  if (!requestContext) {
    safeLog(() => baseLogger.info(additionalContext || {}, "Request started (no context)"));
    return;
  }

  // Full context for first log entry
  const fullContext: LogContext = {
    traceId: requestContext.traceId,
    userId: requestContext.userId,
    path: requestContext.path,
    method: requestContext.method,
    userAgent: requestContext.userAgent,
    ip: requestContext.ip,
    planTier: requestContext.planTier,
    isFreeTier: requestContext.isFreeTier,
    type: "request_start",
    ...additionalContext,
  };

  // Remove undefined values
  Object.keys(fullContext).forEach((key) => {
    if (fullContext[key] === undefined) {
      delete fullContext[key];
    }
  });

  safeLog(() => baseLogger.info(fullContext, `→ ${requestContext.method} ${requestContext.path}`));
}

/**
 * Log the end of a request with duration
 */
export function logRequestEnd(statusCode: number, additionalContext?: LogContext): void {
  const requestContext = getRequestContext();
  const duration = requestContext?.startTime 
    ? Math.round(performance.now() - requestContext.startTime) 
    : undefined;

  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
  const fullContext = getLogContext({
    statusCode,
    duration,
    type: "request_end",
    ...additionalContext,
  });

  const path = requestContext?.path || "unknown";
  const method = requestContext?.method || "?";
  
  safeLog(() => baseLogger[level](fullContext, `← ${method} ${path} ${statusCode} ${duration ? `${duration}ms` : ""}`));
}

/**
 * Log authentication events
 */
export function logAuth(
  event: "success" | "failure" | "rate_limited" | "unauthorized" | "trial_expired",
  context?: LogContext
): void {
  const level = event === "success" ? "info" : "warn";
  const fullContext = getLogContext({
    type: "auth",
    event,
    ...context,
  });

  safeLog(() => baseLogger[level](fullContext, `Auth ${event}`));
}

/**
 * Log credit operations
 */
export function logCredits(
  operation: "deduct" | "refund" | "add" | "check" | "insufficient",
  amount: number,
  context?: LogContext
): void {
  const level = operation === "insufficient" ? "warn" : "info";
  const fullContext = getLogContext({
    type: "credits",
    operation,
    amount,
    ...context,
  });

  safeLog(() => baseLogger[level](fullContext, `Credits ${operation}: ${amount}`));
}

/**
 * Log generation events
 */
export function logGeneration(
  status: "started" | "completed" | "failed" | "queued",
  context?: LogContext & { tool?: string; category?: string; creditsUsed?: number }
): void {
  const level = status === "failed" ? "error" : "info";
  const fullContext = getLogContext({
    type: "generation",
    status,
    ...context,
  });

  safeLog(() => baseLogger[level](fullContext, `Generation ${status}: ${context?.tool || "unknown"}`));
}

/**
 * Log rate limiting events
 */
export function logRateLimit(
  allowed: boolean,
  context?: LogContext & { 
    remaining?: number; 
    limit?: number; 
    reset?: number;
    limitType?: string;
  }
): void {
  const fullContext = getLogContext({
    type: "rate_limit",
    allowed,
    ...context,
  });

  safeLog(() => {
    if (allowed) {
      baseLogger.debug(fullContext, "Rate limit check passed");
    } else {
      baseLogger.warn(fullContext, "Rate limit exceeded");
    }
  });
}

/**
 * Log free tier usage
 */
export function logFreeTierUsage(context: LogContext & {
  category?: string;
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
}): void {
  const fullContext = getLogContext({
    type: "free_tier",
    ...context,
  });

  safeLog(() => baseLogger.info(
    fullContext,
    `Free tier usage: ${context.dailyUsed}/${context.dailyLimit} daily, ${context.monthlyUsed}/${context.monthlyLimit} monthly`
  ));
}

/**
 * Log subscription events
 */
export function logSubscription(
  event: "created" | "activated" | "cancelled" | "expired" | "trial_ended" | "renewed",
  context?: LogContext
): void {
  const fullContext = getLogContext({
    type: "subscription",
    event,
    ...context,
  });

  safeLog(() => baseLogger.info(fullContext, `Subscription ${event}`));
}

// =============================================================================
// PERFORMANCE TIMING
// =============================================================================

/**
 * Create a timer for measuring operation duration
 * Automatically includes request context
 * 
 * @example
 * ```typescript
 * const timer = createTimer("database_query");
 * const result = await db.query(...);
 * timer.done({ rowCount: result.length });
 * // Logs: {"traceId":"...","userId":"...","operation":"database_query","duration":45,...}
 * ```
 */
export function createTimer(operation: string, context?: LogContext) {
  const startTime = performance.now();
  
  return {
    done: (additionalContext?: LogContext) => {
      const duration = Math.round(performance.now() - startTime);
      const fullContext = getLogContext({
        type: "timer",
        operation,
        duration,
        ...context,
        ...additionalContext,
      });

      safeLog(() => baseLogger.debug(fullContext, `${operation} completed in ${duration}ms`));
      return duration;
    },
    elapsed: () => Math.round(performance.now() - startTime),
  };
}

// =============================================================================
// CONTEXT CREATION HELPERS
// =============================================================================

/**
 * Create request context from Next.js request and auth context
 * Used by auth middleware to set up logging context
 */
export function createRequestContext(options: {
  userId?: string | null;
  path?: string;
  method?: string;
  userAgent?: string | null;
  ip?: string | null;
  planTier?: string;
  isFreeTier?: boolean;
}): RequestContext {
  return {
    traceId: generateTraceId(),
    userId: options.userId || undefined,
    path: options.path,
    method: options.method,
    userAgent: options.userAgent || undefined,
    ip: options.ip || undefined,
    planTier: options.planTier,
    isFreeTier: options.isFreeTier,
    startTime: performance.now(),
  };
}

/**
 * Get the current trace ID from context
 * Useful for including in API responses
 */
export function getTraceId(): string | undefined {
  return getRequestContext()?.traceId;
}

// =============================================================================
// EXPORTS
// =============================================================================

// Export the base logger for advanced usage
export { baseLogger as logger };

// Export type
export type { Logger };

