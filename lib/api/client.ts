/**
 * API Client - Base fetch wrapper with retry and timeout support
 * 
 * Provides typed, consistent API calls with:
 * - Error handling
 * - Configurable timeouts
 * - Exponential backoff retry
 * - Request/response logging (in development)
 */

import { API_TIMEOUT, MAX_RETRY_ATTEMPTS, RETRY_DELAY_BASE } from "@/constants/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  /**
   * Check if error is retryable (network errors, 5xx server errors)
   */
  get isRetryable(): boolean {
    return this.status === 0 || this.status >= 500;
  }
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Enable automatic retry with exponential backoff (default: true) */
  retry?: boolean;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay with jitter
 */
function getRetryDelay(attempt: number, baseDelay: number = RETRY_DELAY_BASE): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Add 0-1000ms random jitter
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
}

/**
 * Base fetch function with error handling, timeout, and retry logic
 */
async function baseFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { 
    body, 
    params, 
    headers: customHeaders,
    timeout = API_TIMEOUT,
    retry = true,
    maxRetries = MAX_RETRY_ATTEMPTS,
    ...restOptions 
  } = options;

  // Build URL with query params
  let url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Build headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  let lastError: ApiError | null = null;

  // Retry loop
  for (let attempt = 0; attempt <= (retry ? maxRetries : 0); attempt++) {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle response
      if (!response.ok) {
        let errorData: { error?: string; message?: string; code?: string } = {};
        
        try {
          errorData = await response.json();
        } catch {
          // Response might not be JSON
        }

        const error = new ApiError(
          errorData.error || errorData.message || `Request failed with status ${response.status}`,
          response.status,
          errorData.code,
          errorData
        );

        // Don't retry client errors (4xx)
        if (!error.isRetryable || attempt === maxRetries) {
          throw error;
        }

        lastError = error;
      } else {
        // Success - return parsed JSON or empty object for 204
        if (response.status === 204) {
          return {} as T;
        }

        return response.json();
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        lastError = error;
      } else if (error instanceof Error) {
        // Handle timeout/abort and network errors
        const isTimeout = error.name === "AbortError";
        const isNetworkError = error.message.includes("fetch") || 
                               error.message.includes("network") ||
                               error.message.includes("ECONNREFUSED");
        
        lastError = new ApiError(
          isTimeout ? "Request timeout" : error.message,
          0, // Status 0 for network errors
          isTimeout ? "TIMEOUT" : "NETWORK_ERROR"
        );

        // Only retry network errors
        if (!isTimeout && !isNetworkError) {
          throw lastError;
        }
      }

      // Check if we should retry
      if (!retry || attempt === maxRetries) {
        throw lastError || new ApiError("Unknown error", 0);
      }
    }

    // Wait before retrying with exponential backoff
    const delay = getRetryDelay(attempt);
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`);
    }
    await sleep(delay);
  }

  throw lastError || new ApiError("Unknown error", 0);
}

/**
 * API client with HTTP method helpers
 */
export const api = {
  get: <T>(endpoint: string, params?: FetchOptions["params"]) =>
    baseFetch<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "body">) =>
    baseFetch<T>(endpoint, { method: "POST", body, ...options }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "body">) =>
    baseFetch<T>(endpoint, { method: "PUT", body, ...options }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "body">) =>
    baseFetch<T>(endpoint, { method: "PATCH", body, ...options }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    baseFetch<T>(endpoint, { method: "DELETE", ...options }),
};

export default api;

