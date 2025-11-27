import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";

// ==================== STATUS CODES ====================
/**
 * HTTP status codes used throughout the API.
 * Keep it minimal - only what you actually need.
 */
export const STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
} as const;

// ==================== TYPES ====================
/**
 * Standard success response structure.
 * @template T - Type of the data being returned
 */
interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  meta?: Record<string, any>;
}

/**
 * Standard error response structure.
 * All errors follow this consistent format for easy client-side handling.
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// ==================== VALIDATION ====================
/**
 * Validates request body using Zod schema.
 * Provides runtime type safety, format validation, and clear error messages.
 * 
 * @template T - Zod schema type
 * @param {NextRequest} request - Next.js request object
 * @param {T} schema - Zod schema for validation
 * @returns {Promise<z.infer<T>>} Validated and typed request body
 * @throws {z.ZodError} If validation fails
 * 
 * @example
 * ```typescript
 * const createUserSchema = z.object({
 *   email: z.string().email(),
 *   name: z.string().min(2).max(100),
 *   age: z.number().int().min(18).optional(),
 * });
 * 
 * export const POST = handle(async (req) => {
 *   const body = await validateBody(req, createUserSchema);
 *   // body is fully typed with { email: string; name: string; age?: number }
 * });
 * ```
 */
export async function validateBody<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON format");
    }
    throw error; // Re-throw Zod errors for handle() to catch
  }
}

/**
 * Validates query parameters using Zod schema.
 * 
 * @template T - Zod schema type
 * @param {NextRequest} request - Next.js request object
 * @param {T} schema - Zod schema for validation
 * @returns {z.infer<T>} Validated and typed query parameters
 * @throws {z.ZodError} If validation fails
 * 
 * @example
 * ```typescript
 * const querySchema = z.object({
 *   page: z.coerce.number().int().min(1).default(1),
 *   limit: z.coerce.number().int().min(1).max(100).default(10),
 *   search: z.string().optional(),
 * });
 * 
 * export const GET = handle(async (req) => {
 *   const query = validateQuery(req, querySchema);
 *   // query is typed with { page: number; limit: number; search?: string }
 * });
 * ```
 */
export function validateQuery<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  return schema.parse(params);
}

// ==================== API RESPONSE ====================
/**
 * Centralized API response handler for consistent response formatting.
 * Provides methods for all common HTTP responses with proper status codes.
 * 
 * @example
 * ```typescript
 * // Success responses
 * return Api.ok({ user }, "User fetched");
 * return Api.created({ user }, "User created");
 * 
 * // Error responses
 * return Api.badRequest("Invalid email format");
 * return Api.unauthorized();
 * return Api.insufficientCredits(100, 50);
 * return Api.notFound("User not found");
 * ```
 */
export class ApiResponse {
  /**
   * Returns a 200 OK success response.
   * Use for successful GET, PUT, PATCH, DELETE operations.
   * 
   * @template T - Type of data being returned
   * @param {T} [data] - Response data
   * @param {string} [message] - Optional success message
   * @param {Record<string, any>} [meta] - Optional metadata (pagination, credits, etc.)
   * @returns {NextResponse<SuccessResponse<T>>}
   * 
   * @example
   * ```typescript
   * // Simple data response
   * return Api.ok({ users: [...] });
   * 
   * // With message
   * return Api.ok({ user }, "User updated successfully");
   * 
   * // With metadata
   * return Api.ok(
   *   { users: [...] },
   *   "Users fetched",
   *   { pagination: { page: 1, total: 100 } }
   * );
   * ```
   */
  static ok<T>(data?: T, message?: string, meta?: Record<string, any>) {
    return NextResponse.json(
      {
        success: true,
        ...(data !== undefined && { data }),
        ...(message && { message }),
        ...(meta && { meta }),
      } as SuccessResponse<T>,
      { status: STATUS.OK }
    );
  }

  /**
   * Returns a 201 Created success response.
   * Use for successful POST operations that create new resources.
   * 
   * @template T - Type of created resource
   * @param {T} [data] - Created resource data
   * @param {string} [message] - Optional success message
   * @returns {NextResponse<SuccessResponse<T>>}
   * 
   * @example
   * ```typescript
   * const user = await db.user.create({ data: body });
   * return Api.created({ user }, "User created successfully");
   * ```
   */
  static created<T>(data?: T, message?: string) {
    return NextResponse.json(
      {
        success: true,
        ...(data !== undefined && { data }),
        ...(message && { message }),
      } as SuccessResponse<T>,
      { status: STATUS.CREATED }
    );
  }

  /**
   * Returns a generic error response with custom status code.
   * Prefer using specific error methods (badRequest, unauthorized, etc.) instead.
   * 
   * @param {string} code - Error code for client-side handling
   * @param {string} message - Human-readable error message
   * @param {number} [status=500] - HTTP status code
   * @param {any} [details] - Optional error details
   * @returns {NextResponse<ErrorResponse>}
   * 
   * @example
   * ```typescript
   * return Api.error("CUSTOM_ERROR", "Something specific went wrong", 418);
   * ```
   */
  static error(
    code: string,
    message: string,
    status: number = STATUS.SERVER_ERROR,
    details?: any
  ) {
    // Log server errors (5xx) for monitoring
    if (status >= 500) {
      logError(`API Error [${code}]`, new Error(message), { status, details });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
          ...(details && { details }),
        },
      } as ErrorResponse,
      { status }
    );
  }

  /**
   * Returns a 400 Bad Request error.
   * Use when client sends invalid or malformed data.
   * 
   * @param {string} message - Error message explaining what's wrong
   * @param {any} [details] - Optional details (e.g., which fields are invalid)
   * @returns {NextResponse<ErrorResponse>}
   * 
   * @example
   * ```typescript
   * return Api.badRequest("Invalid email format");
   * return Api.badRequest("Invalid input", { field: "email" });
   * ```
   */
  static badRequest(message: string, details?: any) {
    return this.error("BAD_REQUEST", message, STATUS.BAD_REQUEST, details);
  }

  /**
   * Returns a 401 Unauthorized error.
   * Use when user is not authenticated (missing or invalid token).
   * 
   * @param {string} [message="Authentication required"] - Custom error message
   * @returns {NextResponse<ErrorResponse>}
   * 
   * @example
   * ```typescript
   * if (!session) {
   *   return Api.unauthorized();
   * }
   * 
   * // With custom message
   * return Api.unauthorized("Invalid or expired token");
   * ```
   */
  static unauthorized(message = "Authentication required") {
    return this.error("UNAUTHORIZED", message, STATUS.UNAUTHORIZED);
  }

  /**
   * Returns a 403 Forbidden error for insufficient credits.
   * **ONLY use this for credit-related errors.**
   * 
   * @param {number} [required] - Credits required for the operation
   * @param {number} [available] - User's available credits
   * @param {string} [message] - Custom error message
   * @returns {NextResponse<ErrorResponse>}
   * 
   * @example
   * ```typescript
   * const cost = 100;
   * if (user.credits < cost) {
   *   return Api.insufficientCredits(cost, user.credits);
   * }
   * 
   * // With custom message
   * return Api.insufficientCredits(
   *   100,
   *   50,
   *   "Not enough credits to generate video"
   * );
   * ```
   */
  static insufficientCredits(
    required?: number,
    available?: number,
    message = "Insufficient credits to perform this operation"
  ) {
    return this.error("INSUFFICIENT_CREDITS", message, STATUS.FORBIDDEN, {
      required,
      available,
    });
  }

  /**
   * Returns a 404 Not Found error.
   * Use when requested resource doesn't exist.
   * 
   * @param {string} [message="Resource not found"] - Custom error message
   * @returns {NextResponse<ErrorResponse>}
   * 
   * @example
   * ```typescript
   * const user = await db.user.findUnique({ where: { id } });
   * if (!user) {
   *   return Api.notFound("User not found");
   * }
   * ```
   */
  static notFound(message = "Resource not found") {
    return this.error("NOT_FOUND", message, STATUS.NOT_FOUND);
  }

  /**
   * Returns a 422 Unprocessable Entity error.
   * Use for validation errors when data is syntactically correct but semantically invalid.
   * 
   * @param {string} message - Validation error message
   * @param {string} [field] - Field that failed validation
   * @returns {NextResponse<ErrorResponse>}
   * 
   * @example
   * ```typescript
   * if (!isValidEmail(body.email)) {
   *   return Api.invalid("Invalid email format", "email");
   * }
   * 
   * if (body.age < 18) {
   *   return Api.invalid("User must be 18 or older", "age");
   * }
   * ```
   */
  static invalid(message: string, field?: string) {
    return this.error(
      "VALIDATION_ERROR",
      message,
      STATUS.UNPROCESSABLE,
      field ? { field } : undefined
    );
  }

  /**
   * Returns a 429 Too Many Requests error.
   * Use when user exceeds rate limits.
   * Automatically sets Retry-After header if provided.
   * 
   * @param {number} [retryAfter] - Seconds until retry is allowed
   * @returns {NextResponse<ErrorResponse>}
   * 
   * @example
   * ```typescript
   * if (isRateLimited(userId)) {
   *   return Api.rateLimit(60); // Retry after 60 seconds
   * }
   * ```
   */
  static rateLimit(retryAfter?: number) {
    const response = this.error(
      "RATE_LIMITED",
      "Too many requests. Please try again later.",
      STATUS.RATE_LIMIT
    );

    if (retryAfter) {
      response.headers.set("Retry-After", retryAfter.toString());
    }

    return response;
  }

  /**
   * Returns a 500 Internal Server Error.
   * Use for unexpected errors that aren't the client's fault.
   * 
   * @param {string} [message="Something went wrong. Please try again."] - Error message
   * @returns {NextResponse<ErrorResponse>}
   * 
   * @example
   * ```typescript
   * try {
   *   await externalAPI.call();
   * } catch (error) {
   *   return Api.serverError("External service unavailable");
   * }
   * ```
   */
  static serverError(message = "Something went wrong. Please try again.") {
    return this.error("SERVER_ERROR", message, STATUS.SERVER_ERROR);
  }
}

export default ApiResponse;