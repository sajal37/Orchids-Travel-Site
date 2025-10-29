import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { RateLimiter } from "@/lib/rate-limiter";
import { logger, generateRequestId } from "@/lib/monitoring";
import { auth } from "@/lib/auth";

export interface MiddlewareConfig {
  rateLimit?: RateLimiter;
  requireAuth?: boolean;
  roles?: string[];
}

export function withMiddleware(
  handler: (req: NextRequest, context?: any) => Promise<any>,
  config: MiddlewareConfig = {}
) {
  return async (req: NextRequest, context?: any) => {
    const requestId = req.headers.get("x-request-id") || generateRequestId();
    const startTime = Date.now();

    try {
      // Rate limiting
      if (config.rateLimit) {
        const identifier =
          req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        const result = await config.rateLimit.check(identifier);

        if (!result.allowed) {
          const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
          return ApiResponse.tooManyRequests(
            "Rate limit exceeded",
            retryAfter,
            requestId
          );
        }

        // Add rate limit headers
        const response = await handler(req, context);
        if (response instanceof Response) {
          response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
          response.headers.set("X-RateLimit-Reset", new Date(result.resetAt).toISOString());
        }
      }

      // Authentication
      if (config.requireAuth) {
        const session = await auth.api.getSession({
          headers: req.headers,
        });

        if (!session?.user) {
          return ApiResponse.unauthorized("Authentication required", requestId);
        }

        // Role-based access control
        if (config.roles && config.roles.length > 0) {
          const userRole = (session.user as any).role;
          if (!config.roles.includes(userRole)) {
            return ApiResponse.forbidden(
              "Insufficient permissions",
              requestId
            );
          }
        }

        // Attach user to context
        context = { ...context, user: session.user };
      }

      // Execute handler
      const response = await handler(req, context);

      // Add request ID header
      if (response instanceof Response) {
        response.headers.set("X-Request-ID", requestId);
      }

      // Log successful request
      const duration = Date.now() - startTime;
      logger.info("API request completed", {
        method: req.method,
        path: req.nextUrl.pathname,
        duration,
        requestId,
        status: response.status,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("API request failed", error as Error, {
        method: req.method,
        path: req.nextUrl.pathname,
        duration,
        requestId,
      });

      return ApiResponse.error(
        error as Error,
        500,
        "INTERNAL_ERROR",
        undefined,
        requestId
      );
    }
  };
}
