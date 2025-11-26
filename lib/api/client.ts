/**
 * API Client - Base fetch wrapper
 * 
 * Provides typed, consistent API calls with error handling.
 */

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
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Base fetch function with error handling and JSON parsing
 */
async function baseFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, params, headers: customHeaders, ...restOptions } = options;

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

  // Make request
  const response = await fetch(url, {
    ...restOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle response
  if (!response.ok) {
    let errorData: { error?: string; message?: string; code?: string } = {};
    
    try {
      errorData = await response.json();
    } catch {
      // Response might not be JSON
    }

    throw new ApiError(
      errorData.error || errorData.message || `Request failed with status ${response.status}`,
      response.status,
      errorData.code,
      errorData
    );
  }

  // Return parsed JSON or empty object for 204
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
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

