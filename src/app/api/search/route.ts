import { NextRequest } from "next/server";
import { db } from "@/db";
import { flights, hotels, buses, activities } from "@/db/schema";
import { and, eq, gte, like, lte, sql, desc } from "drizzle-orm";
import { logger, metrics } from "@/lib/monitoring";
import { ApiResponse } from "@/lib/api-response";
import { searchSchema, validateRequest } from "@/lib/validations";
import { DatabaseService } from "@/lib/database-service";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || `req_${Date.now()}`;
  const startTime = Date.now();

  try {
    const body = await request.json();
    
    // Validate request
    const validation = await validateRequest(searchSchema, body);
    if (!validation.success) {
      return ApiResponse.validationError(validation.error, requestId);
    }

    const {
      category,
      from,
      to,
      departDate,
      passengers,
      class: flightClass,
      priceRange,
      rating,
      sortBy,
      sortOrder = "asc",
    } = validation.data;

    // Generate cache key
    const cacheKey = `search:${category}:${JSON.stringify(validation.data)}`;
    
    // Use database service with caching
    const results = await DatabaseService.cached(
      cacheKey,
      async () => {
        let query: any;
        const conditions: any[] = [];

        // Build query based on category
        switch (category) {
          case "flights":
            query = db.select().from(flights);
            
            if (from) {
              conditions.push(like(sql`LOWER(${flights.fromCity})`, `%${from.toLowerCase()}%`));
            }
            
            if (to) {
              conditions.push(like(sql`LOWER(${flights.toCity})`, `%${to.toLowerCase()}%`));
            }
            
            if (departDate) {
              conditions.push(eq(flights.departureTime, departDate));
            }
            
            if (flightClass) {
              conditions.push(eq(flights.classType, flightClass));
            }
            
            if (priceRange) {
              const [min, max] = priceRange;
              if (min !== undefined) conditions.push(gte(flights.price, min));
              if (max !== undefined) conditions.push(lte(flights.price, max));
            }
            break;

          case "hotels":
            query = db.select().from(hotels);
            
            if (to) {
              conditions.push(like(sql`LOWER(${hotels.city})`, `%${to.toLowerCase()}%`));
            }
            
            if (priceRange) {
              const [min, max] = priceRange;
              if (min !== undefined) conditions.push(gte(hotels.pricePerNight, min));
              if (max !== undefined) conditions.push(lte(hotels.pricePerNight, max));
            }
            
            if (rating) {
              conditions.push(gte(hotels.rating, rating));
            }
            break;

          case "buses":
            query = db.select().from(buses);
            
            if (from) {
              conditions.push(like(sql`LOWER(${buses.fromCity})`, `%${from.toLowerCase()}%`));
            }
            
            if (to) {
              conditions.push(like(sql`LOWER(${buses.toCity})`, `%${to.toLowerCase()}%`));
            }
            
            if (departDate) {
              conditions.push(eq(buses.departureTime, departDate));
            }
            
            if (priceRange) {
              const [min, max] = priceRange;
              if (min !== undefined) conditions.push(gte(buses.price, min));
              if (max !== undefined) conditions.push(lte(buses.price, max));
            }
            break;

          case "activities":
            query = db.select().from(activities);
            
            if (to) {
              conditions.push(like(sql`LOWER(${activities.city})`, `%${to.toLowerCase()}%`));
            }
            
            if (priceRange) {
              const [min, max] = priceRange;
              if (min !== undefined) conditions.push(gte(activities.price, min));
              if (max !== undefined) conditions.push(lte(activities.price, max));
            }
            
            if (rating) {
              conditions.push(gte(activities.rating, rating));
            }
            break;

          default:
            return [];
        }

        // Apply conditions
        let finalQuery = conditions.length > 0 
          ? query.where(and(...conditions))
          : query;

        // Apply sorting
        if (sortBy) {
          const sortColumn = category === "hotels" || category === "activities" 
            ? (sortBy === "price" ? hotels.pricePerNight : hotels.rating)
            : (sortBy === "price" ? flights.price : flights.id);
          
          finalQuery = sortOrder === "desc"
            ? finalQuery.orderBy(desc(sortColumn))
            : finalQuery.orderBy(sortColumn);
        }

        // Execute query with limit
        return await finalQuery.limit(50);
      },
      300 // Cache for 5 minutes
    );

    // Track metrics
    const duration = Date.now() - startTime;
    metrics.increment("search.requests", 1, { category });
    metrics.histogram("search.duration", duration);
    metrics.histogram("search.results_count", results.length);

    return ApiResponse.success(
      {
        results,
        category,
        filters: {
          from,
          to,
          departDate,
          priceRange,
          rating,
        },
      },
      200,
      {
        total: results.length,
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    metrics.histogram("search.error_duration", duration);
    
    logger.error("Search API error", error as Error, {
      requestId,
      duration,
    });
    
    return ApiResponse.error(
      error as Error,
      500,
      "SEARCH_ERROR",
      undefined,
      requestId
    );
  }
}