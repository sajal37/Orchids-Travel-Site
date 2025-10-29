import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { flights } from "@/db/schema";
import { eq, like, or, and, gte, lte, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    // Single flight by ID
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

      const flight = await db
        .select()
        .from(flights)
        .where(eq(flights.id, parseInt(id)))
        .limit(1);

      if (flight.length === 0) {
        return NextResponse.json(
          {
            error: "Flight not found",
            code: "FLIGHT_NOT_FOUND",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(flight[0], { status: 200 });
    }

    // List flights with filters and pagination
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");
    const classType = searchParams.get("classType");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    let query = db.select().from(flights);
    const conditions = [];

    // Search in fromCity or toCity
    if (search) {
      conditions.push(
        or(
          like(flights.fromCity, `%${search}%`),
          like(flights.toCity, `%${search}%`)
        )
      );
    }

    // Filter by class type
    if (classType) {
      conditions.push(eq(flights.classType, classType));
    }

    // Filter by price range
    if (minPrice) {
      const minPriceNum = parseInt(minPrice);
      if (!isNaN(minPriceNum)) {
        conditions.push(gte(flights.price, minPriceNum));
      }
    }

    if (maxPrice) {
      const maxPriceNum = parseInt(maxPrice);
      if (!isNaN(maxPriceNum)) {
        conditions.push(lte(flights.price, maxPriceNum));
      }
    }

    // Apply all conditions and execute query
    const results = await (
      conditions.length > 0
        ? db
            .select()
            .from(flights)
            .where(and(...conditions))
        : db.select().from(flights)
    )
      .orderBy(desc(flights.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      {
        error: "Internal server error: " + error,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      airline,
      flightNumber,
      fromCity,
      toCity,
      departureTime,
      arrivalTime,
      duration,
      price,
      availableSeats,
      classType,
      baggageAllowance,
      mealIncluded,
    } = body;

    // Validate required fields
    if (!airline) {
      return NextResponse.json(
        {
          error: "Airline is required",
          code: "MISSING_AIRLINE",
        },
        { status: 400 }
      );
    }

    if (!flightNumber) {
      return NextResponse.json(
        {
          error: "Flight number is required",
          code: "MISSING_FLIGHT_NUMBER",
        },
        { status: 400 }
      );
    }

    if (!fromCity) {
      return NextResponse.json(
        {
          error: "From city is required",
          code: "MISSING_FROM_CITY",
        },
        { status: 400 }
      );
    }

    if (!toCity) {
      return NextResponse.json(
        {
          error: "To city is required",
          code: "MISSING_TO_CITY",
        },
        { status: 400 }
      );
    }

    if (!departureTime) {
      return NextResponse.json(
        {
          error: "Departure time is required",
          code: "MISSING_DEPARTURE_TIME",
        },
        { status: 400 }
      );
    }

    if (!arrivalTime) {
      return NextResponse.json(
        {
          error: "Arrival time is required",
          code: "MISSING_ARRIVAL_TIME",
        },
        { status: 400 }
      );
    }

    if (!duration) {
      return NextResponse.json(
        {
          error: "Duration is required",
          code: "MISSING_DURATION",
        },
        { status: 400 }
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        {
          error: "Price is required",
          code: "MISSING_PRICE",
        },
        { status: 400 }
      );
    }

    if (availableSeats === undefined || availableSeats === null) {
      return NextResponse.json(
        {
          error: "Available seats is required",
          code: "MISSING_AVAILABLE_SEATS",
        },
        { status: 400 }
      );
    }

    if (!classType) {
      return NextResponse.json(
        {
          error: "Class type is required",
          code: "MISSING_CLASS_TYPE",
        },
        { status: 400 }
      );
    }

    // Validate class type enum
    const validClassTypes = ["economy", "business", "first"];
    if (!validClassTypes.includes(classType.toLowerCase())) {
      return NextResponse.json(
        {
          error: "Class type must be economy, business, or first",
          code: "INVALID_CLASS_TYPE",
        },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (isNaN(parseInt(price)) || parseInt(price) < 0) {
      return NextResponse.json(
        {
          error: "Price must be a valid positive number",
          code: "INVALID_PRICE",
        },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(availableSeats)) || parseInt(availableSeats) < 0) {
      return NextResponse.json(
        {
          error: "Available seats must be a valid positive number",
          code: "INVALID_AVAILABLE_SEATS",
        },
        { status: 400 }
      );
    }

    // Create new flight
    const newFlight = await db
      .insert(flights)
      .values({
        airline: airline.trim(),
        flightNumber: flightNumber.trim(),
        fromCity: fromCity.trim(),
        toCity: toCity.trim(),
        departureTime: departureTime.trim(),
        arrivalTime: arrivalTime.trim(),
        duration: duration.trim(),
        price: parseInt(price),
        availableSeats: parseInt(availableSeats),
        classType: classType.toLowerCase().trim(),
        baggageAllowance: baggageAllowance ? baggageAllowance.trim() : null,
        mealIncluded: mealIncluded !== undefined ? mealIncluded : false,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newFlight[0], { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      {
        error: "Internal server error: " + error,
      },
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
        {
          error: "Valid ID is required",
          code: "INVALID_ID",
        },
        { status: 400 }
      );
    }

    // Check if flight exists
    const existingFlight = await db
      .select()
      .from(flights)
      .where(eq(flights.id, parseInt(id)))
      .limit(1);

    if (existingFlight.length === 0) {
      return NextResponse.json(
        {
          error: "Flight not found",
          code: "FLIGHT_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    // Only include fields that are provided
    if (body.airline !== undefined) {
      updates.airline = body.airline.trim();
    }

    if (body.flightNumber !== undefined) {
      updates.flightNumber = body.flightNumber.trim();
    }

    if (body.fromCity !== undefined) {
      updates.fromCity = body.fromCity.trim();
    }

    if (body.toCity !== undefined) {
      updates.toCity = body.toCity.trim();
    }

    if (body.departureTime !== undefined) {
      updates.departureTime = body.departureTime.trim();
    }

    if (body.arrivalTime !== undefined) {
      updates.arrivalTime = body.arrivalTime.trim();
    }

    if (body.duration !== undefined) {
      updates.duration = body.duration.trim();
    }

    if (body.price !== undefined) {
      const priceNum = parseInt(body.price);
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json(
          {
            error: "Price must be a valid positive number",
            code: "INVALID_PRICE",
          },
          { status: 400 }
        );
      }
      updates.price = priceNum;
    }

    if (body.availableSeats !== undefined) {
      const seatsNum = parseInt(body.availableSeats);
      if (isNaN(seatsNum) || seatsNum < 0) {
        return NextResponse.json(
          {
            error: "Available seats must be a valid positive number",
            code: "INVALID_AVAILABLE_SEATS",
          },
          { status: 400 }
        );
      }
      updates.availableSeats = seatsNum;
    }

    if (body.classType !== undefined) {
      const validClassTypes = ["economy", "business", "first"];
      if (!validClassTypes.includes(body.classType.toLowerCase())) {
        return NextResponse.json(
          {
            error: "Class type must be economy, business, or first",
            code: "INVALID_CLASS_TYPE",
          },
          { status: 400 }
        );
      }
      updates.classType = body.classType.toLowerCase().trim();
    }

    if (body.baggageAllowance !== undefined) {
      updates.baggageAllowance = body.baggageAllowance
        ? body.baggageAllowance.trim()
        : null;
    }

    if (body.mealIncluded !== undefined) {
      updates.mealIncluded = body.mealIncluded;
    }

    // Update flight
    const updatedFlight = await db
      .update(flights)
      .set(updates)
      .where(eq(flights.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedFlight[0], { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      {
        error: "Internal server error: " + error,
      },
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
        {
          error: "Valid ID is required",
          code: "INVALID_ID",
        },
        { status: 400 }
      );
    }

    // Check if flight exists
    const existingFlight = await db
      .select()
      .from(flights)
      .where(eq(flights.id, parseInt(id)))
      .limit(1);

    if (existingFlight.length === 0) {
      return NextResponse.json(
        {
          error: "Flight not found",
          code: "FLIGHT_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Delete flight
    const deletedFlight = await db
      .delete(flights)
      .where(eq(flights.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: "Flight deleted successfully",
        flight: deletedFlight[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      {
        error: "Internal server error: " + error,
      },
      { status: 500 }
    );
  }
}
