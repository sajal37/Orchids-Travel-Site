import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { hotels } from "@/db/schema";
import { eq, like, or, and, gte, lte, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: "Valid ID is required", code: "INVALID_ID" },
          { status: 400 }
        );
      }

      const hotel = await db
        .select()
        .from(hotels)
        .where(eq(hotels.id, parseInt(id)))
        .limit(1);

      if (hotel.length === 0) {
        return NextResponse.json(
          { error: "Hotel not found", code: "NOT_FOUND" },
          { status: 404 }
        );
      }

      return NextResponse.json(hotel[0], { status: 200 });
    }

    // List with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const minRating = searchParams.get("minRating");
    const maxRating = searchParams.get("maxRating");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const conditions = [];

    // Search by name or city
    if (search) {
      conditions.push(
        or(like(hotels.name, `%${search}%`), like(hotels.city, `%${search}%`))
      );
    }

    // Filter by city
    if (city) {
      conditions.push(eq(hotels.city, city));
    }

    // Filter by rating range
    if (minRating) {
      const minRatingValue = parseFloat(minRating);
      if (!isNaN(minRatingValue)) {
        conditions.push(gte(hotels.rating, minRatingValue));
      }
    }

    if (maxRating) {
      const maxRatingValue = parseFloat(maxRating);
      if (!isNaN(maxRatingValue)) {
        conditions.push(lte(hotels.rating, maxRatingValue));
      }
    }

    // Filter by price range
    if (minPrice) {
      const minPriceValue = parseInt(minPrice);
      if (!isNaN(minPriceValue)) {
        conditions.push(gte(hotels.pricePerNight, minPriceValue));
      }
    }

    if (maxPrice) {
      const maxPriceValue = parseInt(maxPrice);
      if (!isNaN(maxPriceValue)) {
        conditions.push(lte(hotels.pricePerNight, maxPriceValue));
      }
    }

    // Apply conditions and execute query
    const results = await (
      conditions.length > 0
        ? db
            .select()
            .from(hotels)
            .where(and(...conditions))
        : db.select().from(hotels)
    )
      .orderBy(desc(hotels.createdAt))
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
      "name",
      "location",
      "city",
      "rating",
      "pricePerNight",
      "roomType",
      "availableRooms",
      "checkIn",
      "checkOut",
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
    if (typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Name must be a non-empty string", code: "INVALID_NAME" },
        { status: 400 }
      );
    }

    if (typeof body.location !== "string" || body.location.trim() === "") {
      return NextResponse.json(
        {
          error: "Location must be a non-empty string",
          code: "INVALID_LOCATION",
        },
        { status: 400 }
      );
    }

    if (typeof body.city !== "string" || body.city.trim() === "") {
      return NextResponse.json(
        { error: "City must be a non-empty string", code: "INVALID_CITY" },
        { status: 400 }
      );
    }

    const rating = parseFloat(body.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      return NextResponse.json(
        {
          error: "Rating must be a number between 0 and 5",
          code: "INVALID_RATING",
        },
        { status: 400 }
      );
    }

    const pricePerNight = parseInt(body.pricePerNight);
    if (isNaN(pricePerNight) || pricePerNight < 0) {
      return NextResponse.json(
        {
          error: "Price per night must be a positive number",
          code: "INVALID_PRICE",
        },
        { status: 400 }
      );
    }

    if (typeof body.roomType !== "string" || body.roomType.trim() === "") {
      return NextResponse.json(
        {
          error: "Room type must be a non-empty string",
          code: "INVALID_ROOM_TYPE",
        },
        { status: 400 }
      );
    }

    const availableRooms = parseInt(body.availableRooms);
    if (isNaN(availableRooms) || availableRooms < 0) {
      return NextResponse.json(
        {
          error: "Available rooms must be a non-negative number",
          code: "INVALID_AVAILABLE_ROOMS",
        },
        { status: 400 }
      );
    }

    if (typeof body.checkIn !== "string" || body.checkIn.trim() === "") {
      return NextResponse.json(
        {
          error: "Check-in time must be a non-empty string",
          code: "INVALID_CHECK_IN",
        },
        { status: 400 }
      );
    }

    if (typeof body.checkOut !== "string" || body.checkOut.trim() === "") {
      return NextResponse.json(
        {
          error: "Check-out time must be a non-empty string",
          code: "INVALID_CHECK_OUT",
        },
        { status: 400 }
      );
    }

    // Validate JSON fields if provided
    let amenities = null;
    if (body.amenities !== undefined && body.amenities !== null) {
      if (Array.isArray(body.amenities)) {
        amenities = body.amenities;
      } else {
        return NextResponse.json(
          { error: "Amenities must be an array", code: "INVALID_AMENITIES" },
          { status: 400 }
        );
      }
    }

    let images = null;
    if (body.images !== undefined && body.images !== null) {
      if (Array.isArray(body.images)) {
        images = body.images;
      } else {
        return NextResponse.json(
          { error: "Images must be an array", code: "INVALID_IMAGES" },
          { status: 400 }
        );
      }
    }

    // Sanitize inputs
    const sanitizedData = {
      name: body.name.trim(),
      location: body.location.trim(),
      city: body.city.trim(),
      rating,
      pricePerNight,
      amenities,
      roomType: body.roomType.trim(),
      availableRooms,
      checkIn: body.checkIn.trim(),
      checkOut: body.checkOut.trim(),
      images,
      createdAt: new Date().toISOString(),
    };

    const newHotel = await db.insert(hotels).values(sanitizedData).returning();

    return NextResponse.json(newHotel[0], { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid ID is required", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    // Check if hotel exists
    const existingHotel = await db
      .select()
      .from(hotels)
      .where(eq(hotels.id, parseInt(id)))
      .limit(1);

    if (existingHotel.length === 0) {
      return NextResponse.json(
        { error: "Hotel not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: Record<string, any> = {};

    // Validate and prepare updates
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim() === "") {
        return NextResponse.json(
          { error: "Name must be a non-empty string", code: "INVALID_NAME" },
          { status: 400 }
        );
      }
      updates.name = body.name.trim();
    }

    if (body.location !== undefined) {
      if (typeof body.location !== "string" || body.location.trim() === "") {
        return NextResponse.json(
          {
            error: "Location must be a non-empty string",
            code: "INVALID_LOCATION",
          },
          { status: 400 }
        );
      }
      updates.location = body.location.trim();
    }

    if (body.city !== undefined) {
      if (typeof body.city !== "string" || body.city.trim() === "") {
        return NextResponse.json(
          { error: "City must be a non-empty string", code: "INVALID_CITY" },
          { status: 400 }
        );
      }
      updates.city = body.city.trim();
    }

    if (body.rating !== undefined) {
      const rating = parseFloat(body.rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        return NextResponse.json(
          {
            error: "Rating must be a number between 0 and 5",
            code: "INVALID_RATING",
          },
          { status: 400 }
        );
      }
      updates.rating = rating;
    }

    if (body.pricePerNight !== undefined) {
      const pricePerNight = parseInt(body.pricePerNight);
      if (isNaN(pricePerNight) || pricePerNight < 0) {
        return NextResponse.json(
          {
            error: "Price per night must be a positive number",
            code: "INVALID_PRICE",
          },
          { status: 400 }
        );
      }
      updates.pricePerNight = pricePerNight;
    }

    if (body.roomType !== undefined) {
      if (typeof body.roomType !== "string" || body.roomType.trim() === "") {
        return NextResponse.json(
          {
            error: "Room type must be a non-empty string",
            code: "INVALID_ROOM_TYPE",
          },
          { status: 400 }
        );
      }
      updates.roomType = body.roomType.trim();
    }

    if (body.availableRooms !== undefined) {
      const availableRooms = parseInt(body.availableRooms);
      if (isNaN(availableRooms) || availableRooms < 0) {
        return NextResponse.json(
          {
            error: "Available rooms must be a non-negative number",
            code: "INVALID_AVAILABLE_ROOMS",
          },
          { status: 400 }
        );
      }
      updates.availableRooms = availableRooms;
    }

    if (body.checkIn !== undefined) {
      if (typeof body.checkIn !== "string" || body.checkIn.trim() === "") {
        return NextResponse.json(
          {
            error: "Check-in time must be a non-empty string",
            code: "INVALID_CHECK_IN",
          },
          { status: 400 }
        );
      }
      updates.checkIn = body.checkIn.trim();
    }

    if (body.checkOut !== undefined) {
      if (typeof body.checkOut !== "string" || body.checkOut.trim() === "") {
        return NextResponse.json(
          {
            error: "Check-out time must be a non-empty string",
            code: "INVALID_CHECK_OUT",
          },
          { status: 400 }
        );
      }
      updates.checkOut = body.checkOut.trim();
    }

    if (body.amenities !== undefined) {
      if (body.amenities !== null && !Array.isArray(body.amenities)) {
        return NextResponse.json(
          {
            error: "Amenities must be an array or null",
            code: "INVALID_AMENITIES",
          },
          { status: 400 }
        );
      }
      updates.amenities = body.amenities;
    }

    if (body.images !== undefined) {
      if (body.images !== null && !Array.isArray(body.images)) {
        return NextResponse.json(
          { error: "Images must be an array or null", code: "INVALID_IMAGES" },
          { status: 400 }
        );
      }
      updates.images = body.images;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update", code: "NO_UPDATES" },
        { status: 400 }
      );
    }

    const updatedHotel = await db
      .update(hotels)
      .set(updates)
      .where(eq(hotels.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedHotel[0], { status: 200 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid ID is required", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    // Check if hotel exists
    const existingHotel = await db
      .select()
      .from(hotels)
      .where(eq(hotels.id, parseInt(id)))
      .limit(1);

    if (existingHotel.length === 0) {
      return NextResponse.json(
        { error: "Hotel not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(hotels)
      .where(eq(hotels.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: "Hotel deleted successfully",
        hotel: deleted[0],
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
