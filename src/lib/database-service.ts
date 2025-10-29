import { db } from "@/db";
import { logger, metrics } from "@/lib/monitoring";
import { cache } from "@/lib/cache";
import { sql } from "drizzle-orm";

export class DatabaseService {
  // Execute query with automatic caching
  static async cached<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    try {
      // Try cache first
      const cached = await cache.get(key);
      if (cached !== null) {
        metrics.increment("db.cache.hit");
        return cached as T;
      }

      metrics.increment("db.cache.miss");

      // Execute query
      const startTime = Date.now();
      const result = await queryFn();
      const duration = Date.now() - startTime;

      // Log slow queries
      if (duration > 1000) {
        logger.warn("Slow database query", {
          key,
          duration,
        });
      }

      metrics.histogram("db.query.duration", duration);

      // Cache result
      await cache.set(key, result, ttl);

      return result;
    } catch (error) {
      logger.error("Database query error", error as Error, { key });
      metrics.increment("db.errors");
      throw error;
    }
  }

  // Execute within transaction
  static async transaction<T>(
    callback: (tx: typeof db) => Promise<T>
  ): Promise<T> {
    try {
      const startTime = Date.now();
      
      // Note: Drizzle with libSQL doesn't support transactions the same way
      // For production, you'd use a proper PostgreSQL with transaction support
      const result = await callback(db);
      
      const duration = Date.now() - startTime;
      metrics.histogram("db.transaction.duration", duration);

      return result;
    } catch (error) {
      logger.error("Database transaction error", error as Error);
      metrics.increment("db.transaction.errors");
      throw error;
    }
  }

  // Invalidate cache for specific patterns
  static async invalidateCache(pattern: string): Promise<void> {
    try {
      await cache.del(pattern);
      metrics.increment("db.cache.invalidated");
    } catch (error) {
      logger.error("Cache invalidation error", error as Error, { pattern });
    }
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    try {
      // Simple query to verify database connectivity
      await db.run(sql`SELECT 1`);
      return true;
    } catch (error) {
      logger.error("Database health check failed", error as Error);
      return false;
    }
  }
}
