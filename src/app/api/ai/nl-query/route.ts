import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { flights, hotels, buses, activities } from "@/db/schema";
import { and, gte, lte, eq, desc, asc, SQL, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { naturalLanguage, category } = body;

    if (!naturalLanguage || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["flights", "hotels", "buses", "activities"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Parse natural language to structured query
    const parsedQuery = parseNaturalLanguageQuery(naturalLanguage, category);

    // Validate query safety BEFORE executing
    if (!validateQuerySafety(parsedQuery)) {
      return NextResponse.json(
        {
          error: "Unsafe query detected",
          message:
            "The query contains potentially dangerous patterns and was blocked for security.",
        },
        { status: 400 }
      );
    }

    // Execute REAL database query with Drizzle ORM
    const results = await executeQuery(category, parsedQuery);

    const result = {
      id: `QUERY_${Date.now()}`,
      naturalLanguage,
      parsedQuery,
      category,
      resultsCount: results.length,
      results,
      createdAt: new Date().toISOString(),
      isSafe: true,
    };

    return NextResponse.json({
      success: true,
      data: result,
      message: "Query executed successfully",
    });
  } catch (error) {
    console.error("NL query parsing error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Execute safe database query using Drizzle ORM
async function executeQuery(
  category: string,
  parsedQuery: any
): Promise<any[]> {
  const { filters, sort, limit } = parsedQuery;

  let table: any;
  switch (category) {
    case "flights":
      table = flights;
      break;
    case "hotels":
      table = hotels;
      break;
    case "buses":
      table = buses;
      break;
    case "activities":
      table = activities;
      break;
    default:
      throw new Error("Invalid category");
  }

  // Build WHERE conditions using Drizzle
  const conditions: SQL[] = [];

  if (filters.minPrice !== undefined) {
    const priceCol = category === "hotels" ? table.pricePerNight : table.price;
    conditions.push(gte(priceCol, filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    const priceCol = category === "hotels" ? table.pricePerNight : table.price;
    conditions.push(lte(priceCol, filters.maxPrice));
  }

  if (filters.minRating !== undefined && table.rating) {
    conditions.push(gte(table.rating, filters.minRating));
  }

  // Category-specific filters
  if (category === "flights") {
    if (filters.classType) {
      conditions.push(eq(table.classType, filters.classType));
    }
  }

  if (category === "buses") {
    if (filters.busType) {
      conditions.push(eq(table.busType, filters.busType));
    }
  }

  // Build query
  let query = db.select().from(table);

  // Apply WHERE clause
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  // Apply ORDER BY
  if (sort) {
    const orderFunc = sort.order === "asc" ? asc : desc;
    const sortCol =
      sort.field === "price"
        ? category === "hotels"
          ? table.pricePerNight
          : table.price
        : table[sort.field as keyof typeof table];

    if (sortCol) {
      query = query.orderBy(orderFunc(sortCol)) as any;
    }
  }

  // Apply LIMIT
  if (limit) {
    query = query.limit(Math.min(limit, 50)) as any; // Max 50 results
  } else {
    query = query.limit(20) as any; // Default 20
  }

  return await query;
}

// Parse natural language to structured query
function parseNaturalLanguageQuery(nl: string, category: string): any {
  const query = nl.toLowerCase().trim();
  const filters: any = {};
  let sort: any = undefined;
  let limit: number | undefined = undefined;

  // Price filters with better parsing
  const underMatch = query.match(
    /(?:under|less than|below|cheaper than)\s*(?:\$|₹|rs\.?)?\s*(\d+)/i
  );
  if (underMatch) {
    filters.maxPrice = parseInt(underMatch[1]);
  }

  const aboveMatch = query.match(
    /(?:above|more than|over|at least)\s*(?:\$|₹|rs\.?)?\s*(\d+)/i
  );
  if (aboveMatch) {
    filters.minPrice = parseInt(aboveMatch[1]);
  }

  const betweenMatch = query.match(
    /between\s*(?:\$|₹|rs\.?)?\s*(\d+)\s*(?:and|to)\s*(?:\$|₹|rs\.?)?\s*(\d+)/i
  );
  if (betweenMatch) {
    filters.minPrice = parseInt(betweenMatch[1]);
    filters.maxPrice = parseInt(betweenMatch[2]);
  }

  // Rating filters
  const ratingMatch = query.match(
    /(?:rating|rated)\s*(?:above|over|at least)?\s*([\d.]+)/i
  );
  if (ratingMatch) {
    filters.minRating = parseFloat(ratingMatch[1]);
  }

  // Category-specific filters
  if (category === "flights") {
    if (/\b(?:non-stop|nonstop|direct)\b/i.test(query)) {
      filters.stops = 0;
    }
    if (/\b(?:business class|business)\b/i.test(query)) {
      filters.classType = "business";
    } else if (/\b(?:economy class|economy)\b/i.test(query)) {
      filters.classType = "economy";
    } else if (/\b(?:first class|first)\b/i.test(query)) {
      filters.classType = "first";
    }
  }

  if (category === "buses") {
    if (/\bsleeper\b/i.test(query)) {
      filters.busType = "sleeper";
    } else if (/\b(?:semi-sleeper|semi sleeper)\b/i.test(query)) {
      filters.busType = "semi-sleeper";
    } else if (/\b(?:ac|air conditioned|air-conditioned)\b/i.test(query)) {
      filters.busType = "ac";
    }
  }

  // Sorting
  if (/\b(?:cheapest|lowest price|most affordable)\b/i.test(query)) {
    sort = { field: "price", order: "asc" };
  } else if (/\b(?:most expensive|highest price|priciest)\b/i.test(query)) {
    sort = { field: "price", order: "desc" };
  } else if (/\b(?:highest rated|best rated|top rated)\b/i.test(query)) {
    sort = { field: "rating", order: "desc" };
  } else if (/\b(?:fastest|shortest duration|quickest)\b/i.test(query)) {
    sort = { field: "duration", order: "asc" };
  }

  // Limit parsing
  const topMatch = query.match(/\b(?:top|best|first)\s+(\d+)\b/i);
  if (topMatch) {
    limit = parseInt(topMatch[1]);
  } else if (/\b(?:top|best)\b/i.test(query) && !topMatch) {
    limit = 5; // Default "top" without number means 5
  }

  return {
    filters,
    sort,
    limit,
  };
}

// Validate query safety - prevent SQL injection and XSS
function validateQuerySafety(parsedQuery: any): boolean {
  const queryStr = JSON.stringify(parsedQuery);

  // Block dangerous SQL patterns
  const sqlInjectionPatterns = [
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+.*\s+set/i,
    /;\s*drop/i,
    /union\s+select/i,
    /--/,
    /\/\*/,
    /xp_/i,
  ];

  // Block XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /onload=/i,
  ];

  // Block command injection
  const commandPatterns = [
    /exec\s*\(/i,
    /eval\s*\(/i,
    /system\s*\(/i,
    /passthru/i,
    /shell_exec/i,
  ];

  const allPatterns = [
    ...sqlInjectionPatterns,
    ...xssPatterns,
    ...commandPatterns,
  ];

  for (const pattern of allPatterns) {
    if (pattern.test(queryStr)) {
      console.warn("Blocked unsafe query pattern:", pattern);
      return false;
    }
  }

  // Validate numeric values
  if (parsedQuery.filters) {
    const { minPrice, maxPrice, minRating } = parsedQuery.filters;

    if (
      minPrice !== undefined &&
      (typeof minPrice !== "number" || minPrice < 0 || minPrice > 10000000)
    ) {
      return false;
    }

    if (
      maxPrice !== undefined &&
      (typeof maxPrice !== "number" || maxPrice < 0 || maxPrice > 10000000)
    ) {
      return false;
    }

    if (
      minRating !== undefined &&
      (typeof minRating !== "number" || minRating < 0 || minRating > 5)
    ) {
      return false;
    }
  }

  // Validate limit
  if (parsedQuery.limit !== undefined) {
    if (
      typeof parsedQuery.limit !== "number" ||
      parsedQuery.limit < 1 ||
      parsedQuery.limit > 100
    ) {
      return false;
    }
  }

  return true;
}
