import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq, like, or, and, gte, lte, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          {
            error: "Valid ID is required",
            code: "INVALID_ID",
          },
          { status: 400 }
        );
      }

      const activity = await db
        .select()
        .from(activities)
        .where(eq(activities.id, parseInt(id)))
        .limit(1);

      if (activity.length === 0) {
        return NextResponse.json(
          { error: "Activity not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(activity[0], { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const category = searchParams.get("category");
    const minRating = searchParams.get("minRating");
    const maxRating = searchParams.get("maxRating");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    let query = db.select().from(activities);
    const conditions = [];

    // Search condition (title, city, or category)
    if (search) {
      conditions.push(
        or(
          like(activities.title, `%${search}%`),
          like(activities.city, `%${search}%`),
          like(activities.category, `%${search}%`)
        )
      );
    }

    // City filter
    if (city) {
      conditions.push(eq(activities.city, city));
    }

    // Category filter
    if (category) {
      conditions.push(eq(activities.category, category));
    }

    // Rating filters
    if (minRating) {
      const minRatingValue = parseFloat(minRating);
      if (!isNaN(minRatingValue)) {
        conditions.push(gte(activities.rating, minRatingValue));
      }
    }

    if (maxRating) {
      const maxRatingValue = parseFloat(maxRating);
      if (!isNaN(maxRatingValue)) {
        conditions.push(lte(activities.rating, maxRatingValue));
      }
    }

    // Price filters
    if (minPrice) {
      const minPriceValue = parseInt(minPrice);
      if (!isNaN(minPriceValue)) {
        conditions.push(gte(activities.price, minPriceValue));
      }
    }

    if (maxPrice) {
      const maxPriceValue = parseInt(maxPrice);
      if (!isNaN(maxPriceValue)) {
        conditions.push(lte(activities.price, maxPriceValue));
      }
    }

    // Apply all conditions and execute query
    const results = await (
      conditions.length > 0
        ? db
            .select()
            .from(activities)
            .where(and(...conditions))
        : db.select().from(activities)
    )
      .orderBy(desc(activities.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "title",
      "location",
      "city",
      "description",
      "category",
      "duration",
      "price",
      "rating",
      "maxParticipants",
      "availableSpots",
    ];

    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          {
            error: `${field} is required`,
            code: "MISSING_REQUIRED_FIELD",
          },
          { status: 400 }
        );
      }
    }

    // Validate data types
    if (typeof body.price !== "number" || body.price < 0) {
      return NextResponse.json(
        {
          error: "price must be a non-negative number",
          code: "INVALID_PRICE",
        },
        { status: 400 }
      );
    }

    if (typeof body.rating !== "number" || body.rating < 0 || body.rating > 5) {
      return NextResponse.json(
        {
          error: "rating must be a number between 0 and 5",
          code: "INVALID_RATING",
        },
        { status: 400 }
      );
    }

    if (typeof body.maxParticipants !== "number" || body.maxParticipants < 1) {
      return NextResponse.json(
        {
          error: "maxParticipants must be a positive number",
          code: "INVALID_MAX_PARTICIPANTS",
        },
        { status: 400 }
      );
    }

    if (typeof body.availableSpots !== "number" || body.availableSpots < 0) {
      return NextResponse.json(
        {
          error: "availableSpots must be a non-negative number",
          code: "INVALID_AVAILABLE_SPOTS",
        },
        { status: 400 }
      );
    }

    // Sanitize string inputs
    const sanitizedData = {
      title: body.title.trim(),
      location: body.location.trim(),
      city: body.city.trim(),
      description: body.description.trim(),
      category: body.category.trim(),
      duration: body.duration.trim(),
      price: body.price,
      rating: body.rating,
      maxParticipants: body.maxParticipants,
      availableSpots: body.availableSpots,
      includes: body.includes || null,
      images: body.images || null,
      createdAt: new Date().toISOString(),
    };

    // Validate JSON fields if provided
    if (sanitizedData.includes !== null) {
      if (!Array.isArray(sanitizedData.includes)) {
        return NextResponse.json(
          {
            error: "includes must be an array",
            code: "INVALID_INCLUDES_FORMAT",
          },
          { status: 400 }
        );
      }
    }

    if (sanitizedData.images !== null) {
      if (!Array.isArray(sanitizedData.images)) {
        return NextResponse.json(
          {
            error: "images must be an array",
            code: "INVALID_IMAGES_FORMAT",
          },
          { status: 400 }
        );
      }
    }

    const newActivity = await db
      .insert(activities)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newActivity[0], { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: "Valid ID is required",
          code: "INVALID_ID",
        },
        { status: 400 }
      );
    }

    // Check if activity exists
    const existingActivity = await db
      .select()
      .from(activities)
      .where(eq(activities.id, parseInt(id)))
      .limit(1);

    if (existingActivity.length === 0) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate data types if fields are provided
    if (body.price !== undefined) {
      if (typeof body.price !== "number" || body.price < 0) {
        return NextResponse.json(
          {
            error: "price must be a non-negative number",
            code: "INVALID_PRICE",
          },
          { status: 400 }
        );
      }
    }

    if (body.rating !== undefined) {
      if (
        typeof body.rating !== "number" ||
        body.rating < 0 ||
        body.rating > 5
      ) {
        return NextResponse.json(
          {
            error: "rating must be a number between 0 and 5",
            code: "INVALID_RATING",
          },
          { status: 400 }
        );
      }
    }

    if (body.maxParticipants !== undefined) {
      if (
        typeof body.maxParticipants !== "number" ||
        body.maxParticipants < 1
      ) {
        return NextResponse.json(
          {
            error: "maxParticipants must be a positive number",
            code: "INVALID_MAX_PARTICIPANTS",
          },
          { status: 400 }
        );
      }
    }

    if (body.availableSpots !== undefined) {
      if (typeof body.availableSpots !== "number" || body.availableSpots < 0) {
        return NextResponse.json(
          {
            error: "availableSpots must be a non-negative number",
            code: "INVALID_AVAILABLE_SPOTS",
          },
          { status: 400 }
        );
      }
    }

    // Validate JSON fields if provided
    if (body.includes !== undefined && body.includes !== null) {
      if (!Array.isArray(body.includes)) {
        return NextResponse.json(
          {
            error: "includes must be an array",
            code: "INVALID_INCLUDES_FORMAT",
          },
          { status: 400 }
        );
      }
    }

    if (body.images !== undefined && body.images !== null) {
      if (!Array.isArray(body.images)) {
        return NextResponse.json(
          {
            error: "images must be an array",
            code: "INVALID_IMAGES_FORMAT",
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data, sanitize strings
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.location !== undefined) updateData.location = body.location.trim();
    if (body.city !== undefined) updateData.city = body.city.trim();
    if (body.description !== undefined)
      updateData.description = body.description.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.duration !== undefined) updateData.duration = body.duration.trim();
    if (body.price !== undefined) updateData.price = body.price;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.maxParticipants !== undefined)
      updateData.maxParticipants = body.maxParticipants;
    if (body.availableSpots !== undefined)
      updateData.availableSpots = body.availableSpots;
    if (body.includes !== undefined) updateData.includes = body.includes;
    if (body.images !== undefined) updateData.images = body.images;

    // Don't allow updating id or createdAt
    delete updateData.id;
    delete updateData.createdAt;

    const updatedActivity = await db
      .update(activities)
      .set(updateData)
      .where(eq(activities.id, parseInt(id)))
      .returning();

    if (updatedActivity.length === 0) {
      return NextResponse.json(
        { error: "Failed to update activity" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedActivity[0], { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: "Valid ID is required",
          code: "INVALID_ID",
        },
        { status: 400 }
      );
    }

    // Check if activity exists
    const existingActivity = await db
      .select()
      .from(activities)
      .where(eq(activities.id, parseInt(id)))
      .limit(1);

    if (existingActivity.length === 0) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    const deletedActivity = await db
      .delete(activities)
      .where(eq(activities.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: "Activity deleted successfully",
        activity: deletedActivity[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error },
      { status: 500 }
    );
  }
}
