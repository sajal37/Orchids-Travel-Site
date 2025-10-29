import { createClient } from "@libsql/client";
import { logger } from "@/lib/monitoring";

// Redis client for caching
class CacheClient {
  private client: any;
  private isConnected: boolean = false;

  constructor() {
    try {
      // Only initialize if REDIS_URL is provided
      if (process.env.REDIS_URL) {
        // For now, we'll use a simple in-memory cache as fallback
        // In production, you would use a real Redis client like:
        // this.client = redis.createClient({ url: process.env.REDIS_URL });
        // await this.client.connect();
        this.isConnected = true;
      }
    } catch (error) {
      logger.error("Failed to connect to Redis", error as Error);
      this.isConnected = false;
    }
  }

  // Simple in-memory cache implementation as fallback
  private memoryCache: Map<string, { value: any; expiry: number }> = new Map();

  async get(key: string): Promise<any> {
    try {
      if (this.isConnected) {
        // Use real Redis client
        // return await this.client.get(key);
        
        // For now, use in-memory cache
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.value;
        } else if (cached) {
          this.memoryCache.delete(key);
        }
        return null;
      } else {
        // Fallback to in-memory cache
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.value;
        } else if (cached) {
          this.memoryCache.delete(key);
        }
        return null;
      }
    } catch (error) {
      logger.error(`Cache GET error for key: ${key}`, error as Error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<boolean> {
    try {
      const expiry = Date.now() + ttl * 1000;
      
      if (this.isConnected) {
        // Use real Redis client
        // await this.client.set(key, JSON.stringify(value), { EX: ttl });
        
        // For now, use in-memory cache
        this.memoryCache.set(key, { value, expiry });
        return true;
      } else {
        // Fallback to in-memory cache
        this.memoryCache.set(key, { value, expiry });
        return true;
      }
    } catch (error) {
      logger.error(`Cache SET error for key: ${key}`, error as Error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (this.isConnected) {
        // Use real Redis client
        // await this.client.del(key);
        
        // For now, use in-memory cache
        this.memoryCache.delete(key);
        return true;
      } else {
        // Fallback to in-memory cache
        this.memoryCache.delete(key);
        return true;
      }
    } catch (error) {
      logger.error(`Cache DEL error for key: ${key}`, error as Error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      if (this.isConnected) {
        // Use real Redis client
        // await this.client.flushAll();
        
        // For now, use in-memory cache
        this.memoryCache.clear();
        return true;
      } else {
        // Fallback to in-memory cache
        this.memoryCache.clear();
        return true;
      }
    } catch (error) {
      logger.error("Cache FLUSH error", error as Error);
      return false;
    }
  }
}

// Export singleton instance
export const cache = new CacheClient();

// Cache decorator for async functions
export function cached(ttl: number = 300) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}_${JSON.stringify(args)}`;
      let result = await cache.get(cacheKey);

      if (result === null) {
        result = await method.apply(this, args);
        await cache.set(cacheKey, result, ttl);
      }

      return result;
    };

    return descriptor;
  };
}