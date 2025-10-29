import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { flights, hotels, buses, activities } from "@/db/schema";
import { desc, eq, and, gte, lte, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, category, context } = body;

    if (!userId || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["flights", "hotels", "buses", "activities"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Generate personalized recommendations using REAL database data
    const recommendations = await generateRecommendations(
      userId,
      category,
      context
    );

    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
      message: "Recommendations generated successfully",
    });
  } catch (error) {
    console.error("AI recommendations error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function generateRecommendations(
  userId: string,
  category: string,
  context: any
): Promise<any[]> {
  let items: any[] = [];

  // Fetch REAL data from database with intelligent filtering
  switch (category) {
    case "flights":
      items = await db
        .select()
        .from(flights)
        .where(
          and(
            context?.minPrice
              ? gte(flights.price, context.minPrice)
              : undefined,
            context?.maxPrice
              ? lte(flights.price, context.maxPrice)
              : undefined,
            gte(flights.availableSeats, 1)
          )
        )
        .limit(20);
      break;

    case "hotels":
      items = await db
        .select()
        .from(hotels)
        .where(
          and(
            context?.minPrice
              ? gte(hotels.pricePerNight, context.minPrice)
              : undefined,
            context?.maxPrice
              ? lte(hotels.pricePerNight, context.maxPrice)
              : undefined,
            gte(hotels.availableRooms, 1)
          )
        )
        .limit(20);
      break;

    case "buses":
      items = await db
        .select()
        .from(buses)
        .where(
          and(
            context?.minPrice ? gte(buses.price, context.minPrice) : undefined,
            context?.maxPrice ? lte(buses.price, context.maxPrice) : undefined,
            gte(buses.availableSeats, 1)
          )
        )
        .limit(20);
      break;

    case "activities":
      items = await db
        .select()
        .from(activities)
        .where(
          and(
            context?.minPrice
              ? gte(activities.price, context.minPrice)
              : undefined,
            context?.maxPrice
              ? lte(activities.price, context.maxPrice)
              : undefined,
            gte(activities.availableSpots, 1)
          )
        )
        .limit(20);
      break;

    default:
      return [];
  }

  if (items.length === 0) {
    return [];
  }

  // Intelligent scoring algorithm based on multiple factors
  const scoredItems = items.map((item) => {
    let score = 50; // Base score
    const reasons: string[] = [];

    // Price optimization scoring
    const price = item.price || item.pricePerNight || 0;
    const priceScore = calculatePriceScore(price, context?.budget);
    score += priceScore.score;
    if (priceScore.reason) reasons.push(priceScore.reason);

    // Rating-based scoring with weighted importance
    if (item.rating) {
      const ratingScore = item.rating * 15; // Higher weight for ratings
      score += ratingScore;
      if (item.rating >= 4.5) {
        reasons.push("⭐ Highly rated");
      } else if (item.rating >= 4.0) {
        reasons.push("👍 Good rating");
      }
    }

    // Availability scoring - prefer better availability
    const availabilityScore = calculateAvailabilityScore(item);
    score += availabilityScore.score;
    if (availabilityScore.reason) reasons.push(availabilityScore.reason);

    // Category-specific intelligent scoring
    const categoryScore = calculateCategoryScore(category, item, context);
    score += categoryScore.score;
    reasons.push(...categoryScore.reasons);

    // Normalize score to 0-100 range
    const normalizedScore = Math.max(0, Math.min(100, score));

    return {
      id: `REC_${Date.now()}_${item.id}`,
      userId,
      itemId: item.id,
      category,
      score: normalizedScore,
      reason: reasons.join(" • "),
      confidence: calculateConfidence(normalizedScore, reasons.length),
      item,
      createdAt: new Date().toISOString(),
    };
  });

  // Sort by score (highest first) and return top 5
  return scoredItems.sort((a, b) => b.score - a.score).slice(0, 5);
}

function calculatePriceScore(
  price: number,
  budget?: number
): { score: number; reason?: string } {
  if (!budget) {
    // Default scoring without budget context
    if (price < 5000) return { score: 25, reason: "💰 Great value" };
    if (price < 15000) return { score: 15, reason: "👌 Good price" };
    if (price > 50000) return { score: 5, reason: "💎 Premium" };
    return { score: 10 };
  }

  // Score based on how well it fits the budget
  const budgetRatio = price / budget;
  if (budgetRatio <= 0.7) return { score: 30, reason: "💰 Well under budget" };
  if (budgetRatio <= 0.9) return { score: 20, reason: "✅ Within budget" };
  if (budgetRatio <= 1.0) return { score: 10, reason: "⚖️ At budget limit" };
  return { score: -10, reason: "⚠️ Over budget" };
}

function calculateAvailabilityScore(item: any): {
  score: number;
  reason?: string;
} {
  const seats =
    item.availableSeats || item.availableRooms || item.availableSpots || 0;

  if (seats > 20) return { score: 15, reason: "✅ Excellent availability" };
  if (seats > 10) return { score: 10, reason: "👍 Good availability" };
  if (seats > 5) return { score: 5, reason: "⚡ Limited seats" };
  return { score: 0, reason: "⚠️ Very limited" };
}

function calculateCategoryScore(
  category: string,
  item: any,
  context: any
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  switch (category) {
    case "flights":
      // Prefer non-stop flights
      if (item.flightNumber && !item.flightNumber.includes("STOP")) {
        score += 20;
        reasons.push("✈️ Direct flight");
      }

      // Meal included bonus
      if (item.mealIncluded) {
        score += 10;
        reasons.push("🍽️ Meals included");
      }

      // Premium class bonus
      if (item.classType === "business" || item.classType === "first") {
        score += 15;
        reasons.push("👔 Premium class");
      }
      break;

    case "hotels":
      // Amenities scoring
      const amenities =
        typeof item.amenities === "string"
          ? JSON.parse(item.amenities)
          : item.amenities || [];

      if (amenities.length >= 5) {
        score += 20;
        reasons.push("🏨 Excellent amenities");
      } else if (amenities.length >= 3) {
        score += 10;
        reasons.push("🛎️ Good amenities");
      }
      break;

    case "buses":
      // Bus type preference
      if (item.busType === "sleeper") {
        score += 15;
        reasons.push("🛏️ Sleeper bus");
      } else if (item.busType === "semi-sleeper") {
        score += 10;
        reasons.push("💺 Semi-sleeper");
      }
      break;

    case "activities":
      // Duration scoring
      if (item.duration) {
        const hours = parseInt(item.duration);
        if (hours >= 4 && hours <= 8) {
          score += 15;
          reasons.push("⏱️ Perfect duration");
        }
      }

      // Popular activities bonus
      if (item.maxParticipants > 20) {
        score += 10;
        reasons.push("🎉 Popular activity");
      }
      break;
  }

  return { score, reasons };
}

function calculateConfidence(score: number, reasonCount: number): number {
  // Confidence based on score and number of reasons
  let confidence = 50;

  if (score >= 80) confidence += 30;
  else if (score >= 60) confidence += 20;
  else if (score >= 40) confidence += 10;

  confidence += Math.min(20, reasonCount * 3);

  return Math.min(100, confidence);
}
