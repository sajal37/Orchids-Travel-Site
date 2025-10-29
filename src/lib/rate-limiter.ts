import { cache } from "@/lib/cache";
import { logger } from "@/lib/monitoring";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: "ratelimit",
      ...config,
    };
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Get current request count
      const cached = await cache.get(key);
      const data: { count: number; resetAt: number } = cached
        ? JSON.parse(cached)
        : { count: 0, resetAt: now + this.config.windowMs };

      // Reset if window expired
      if (now > data.resetAt) {
        data.count = 0;
        data.resetAt = now + this.config.windowMs;
      }

      // Check if limit exceeded
      if (data.count >= this.config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: data.resetAt,
        };
      }

      // Increment count
      data.count++;

      // Save to cache
      const ttl = Math.ceil((data.resetAt - now) / 1000);
      await cache.set(key, JSON.stringify(data), ttl);

      return {
        allowed: true,
        remaining: this.config.maxRequests - data.count,
        resetAt: data.resetAt,
      };
    } catch (error) {
      logger.error("Rate limiter error", error as Error, { identifier });
      // Fail open - allow request if rate limiter fails
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetAt: now + this.config.windowMs,
      };
    }
  }

  async reset(identifier: string): Promise<void> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    await cache.del(key);
  }
}

// Predefined rate limiters
export const apiRateLimiter = new RateLimiter({
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  keyPrefix: "api",
});

export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: "auth",
});

export const paymentRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: "payment",
});
