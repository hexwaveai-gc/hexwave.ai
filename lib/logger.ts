/**
 * Simple logger utility
 * Can be replaced with a proper logging service (e.g., BetterStack) later
 */

type LogContext = Record<string, unknown>;

/**
 * Log info level message
 */
export function logInfo(message: string, context?: LogContext): void {
  console.log(`[INFO] ${message}`, context ? JSON.stringify(context) : "");
}

/**
 * Log warning level message
 */
export function logWarn(message: string, context?: LogContext): void {
  console.warn(`[WARN] ${message}`, context ? JSON.stringify(context) : "");
}

/**
 * Log error level message
 */
export function logError(
  message: string,
  error?: unknown,
  context?: LogContext
): void {
  console.error(
    `[ERROR] ${message}`,
    error instanceof Error ? error.message : error,
    context ? JSON.stringify(context) : ""
  );
}

/**
 * Log debug level message (only in development)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[DEBUG] ${message}`, context ? JSON.stringify(context) : "");
  }
}





