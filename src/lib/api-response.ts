import { NextResponse } from "next/server";
import { logger, metrics } from "@/lib/monitoring";
import { ZodError } from "zod";

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
  };
  timestamp: string;
  requestId?: string;
}

export class ApiResponse {
  static success<T>(
    data: T,
    status: number = 200,
    meta?: Partial<ApiSuccessResponse["meta"]>
  ): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          ...meta,
          timestamp: new Date().toISOString(),
        },
      },
      { status }
    );
  }

  static error(
    error: Error | string,
    status: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: any,
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    const errorMessage = typeof error === "string" ? error : error.message;
    const errorStack =
      process.env.NODE_ENV === "development" && typeof error !== "string"
        ? error.stack
        : undefined;

    // Log error
    if (typeof error !== "string") {
      logger.error("API Error", error, { code, details, requestId });
      metrics.increment("api.errors", 1, { code, status: status.toString() });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message: errorMessage,
          details,
          stack: errorStack,
        },
        timestamp: new Date().toISOString(),
        requestId,
      },
      { status }
    );
  }

  static validationError(
    error: ZodError | string,
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    if (typeof error === "string") {
      return ApiResponse.error(error, 400, "VALIDATION_ERROR", null, requestId);
    }

    const details = error.issues.map((err: any) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
    }));

    return ApiResponse.error(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      details,
      requestId
    );
  }

  static unauthorized(
    message: string = "Authentication required",
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    return ApiResponse.error(message, 401, "UNAUTHORIZED", null, requestId);
  }

  static forbidden(
    message: string = "Access forbidden",
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    return ApiResponse.error(message, 403, "FORBIDDEN", null, requestId);
  }

  static notFound(
    resource: string = "Resource",
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    return ApiResponse.error(
      `${resource} not found`,
      404,
      "NOT_FOUND",
      null,
      requestId
    );
  }

  static conflict(
    message: string = "Resource conflict",
    details?: any,
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    return ApiResponse.error(message, 409, "CONFLICT", details, requestId);
  }

  static tooManyRequests(
    message: string = "Rate limit exceeded",
    retryAfter?: number,
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    const response = ApiResponse.error(
      message,
      429,
      "RATE_LIMIT_EXCEEDED",
      { retryAfter },
      requestId
    );

    if (retryAfter) {
      response.headers.set("Retry-After", retryAfter.toString());
    }

    return response;
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): NextResponse<ApiSuccessResponse<T[]>> {
    return ApiResponse.success(data, 200, {
      page,
      limit,
      total,
    });
  }
}
