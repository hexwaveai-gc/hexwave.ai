/**
 * API Constants
 * 
 * Configuration values for API client, retry logic, and timeouts.
 */

// Request timeouts
export const API_TIMEOUT = 30000; // 30 seconds

// Retry configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_BASE = 1000; // 1 second base delay for exponential backoff

// Cache durations (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 30 * 1000,           // 30 seconds - for frequently changing data
  MEDIUM: 5 * 60 * 1000,      // 5 minutes - default
  LONG: 30 * 60 * 1000,       // 30 minutes - for semi-static data
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours - for static data
} as const;

// Stale times (in milliseconds)
export const STALE_TIME = {
  IMMEDIATE: 0,               // Always fetch fresh
  SHORT: 30 * 1000,           // 30 seconds
  MEDIUM: 60 * 1000,          // 1 minute
  LONG: 5 * 60 * 1000,        // 5 minutes
} as const;

// Refetch intervals (in milliseconds)
export const REFETCH_INTERVAL = {
  FAST: 10 * 1000,            // 10 seconds - for real-time data
  MEDIUM: 30 * 1000,          // 30 seconds
  SLOW: 60 * 1000,            // 1 minute
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error codes
export const API_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  SERVER_ERROR: "SERVER_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNKNOWN: "UNKNOWN",
} as const;

