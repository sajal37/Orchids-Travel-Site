import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { buses } from "@/db/schema";
import { eq, like, or, and, gte, lte, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: "Valid ID is required", code: "INVALID_ID" },
          { status: 400 }
        );
      }

      const bus = await db
        .select()
        .from(buses)
        .where(eq(buses.id, parseInt(id)))
        .limit(1);

      if (bus.length === 0) {
        return NextResponse.json(
          { error: "Bus not found", code: "BUS_NOT_FOUND" },
          { status: 404 }
        );
      }

      return NextResponse.json(bus[0], { status: 200 });
    }

    // List with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");
    const busType = searchParams.get("busType");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    let query = db.select().from(buses);
    const conditions = [];

    // Search across fromCity, toCity, operator
    if (search) {
      conditions.push(
        or(
          like(buses.fromCity, `%${search}%`),
          like(buses.toCity, `%${search}%`),
          like(buses.operator, `%${search}%`)
        )
      );
    }

    // Filter by bus type
    if (busType) {
      conditions.push(eq(buses.busType, busType));
    }

    // Filter by price range
    if (minPrice) {
      const minPriceInt = parseInt(minPrice);
      if (!isNaN(minPriceInt)) {
        conditions.push(gte(buses.price, minPriceInt));
      }
    }

    if (maxPrice) {
      const maxPriceInt = parseInt(maxPrice);
      if (!isNaN(maxPriceInt)) {
        conditions.push(lte(buses.price, maxPriceInt));
      }
    }

    // Apply conditions and execute query
    const results = await (
      conditions.length > 0
        ? db
            .select()
            .from(buses)
            .where(and(...conditions))
        : db.select().from(buses)
    )
      .orderBy(desc(buses.createdAt))
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
    const {
      operator,
      busNumber,
      fromCity,
      toCity,
      departureTime,
      arrivalTime,
      duration,
      price,
      availableSeats,
      busType,
      amenities,
    } = body;

    // Validate required fields
    if (!operator) {
      return NextResponse.json(
        { error: "Operator is required", code: "MISSING_OPERATOR" },
        { status: 400 }
      );
    }

    if (!busNumber) {
      return NextResponse.json(
        { error: "Bus number is required", code: "MISSING_BUS_NUMBER" },
        { status: 400 }
      );
    }

    if (!fromCity) {
      return NextResponse.json(
        { error: "From city is required", code: "MISSING_FROM_CITY" },
        { status: 400 }
      );
    }

    if (!toCity) {
      return NextResponse.json(
        { error: "To city is required", code: "MISSING_TO_CITY" },
        { status: 400 }
      );
    }

    if (!departureTime) {
      return NextResponse.json(
        { error: "Departure time is required", code: "MISSING_DEPARTURE_TIME" },
        { status: 400 }
      );
    }

    if (!arrivalTime) {
      return NextResponse.json(
        { error: "Arrival time is required", code: "MISSING_ARRIVAL_TIME" },
        { status: 400 }
      );
    }

    if (!duration) {
      return NextResponse.json(
        { error: "Duration is required", code: "MISSING_DURATION" },
        { status: 400 }
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        { error: "Price is required", code: "MISSING_PRICE" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Price must be a positive number", code: "INVALID_PRICE" },
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

    if (typeof availableSeats !== "number" || availableSeats < 0) {
      return NextResponse.json(
        {
          error: "Available seats must be a positive number",
          code: "INVALID_AVAILABLE_SEATS",
        },
        { status: 400 }
      );
    }

    if (!busType) {
      return NextResponse.json(
        { error: "Bus type is required", code: "MISSING_BUS_TYPE" },
        { status: 400 }
      );
    }

    // Validate bus type
    const validBusTypes = ["sleeper", "seater", "semi-sleeper"];
    if (!validBusTypes.includes(busType.toLowerCase())) {
      return NextResponse.json(
        {
          error: "Bus type must be one of: sleeper, seater, semi-sleeper",
          code: "INVALID_BUS_TYPE",
        },
        { status: 400 }
      );
    }

    // Validate amenities is array if provided
    if (amenities !== undefined && amenities !== null) {
      if (!Array.isArray(amenities)) {
        return NextResponse.json(
          { error: "Amenities must be an array", code: "INVALID_AMENITIES" },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData = {
      operator: operator.trim(),
      busNumber: busNumber.trim(),
      fromCity: fromCity.trim(),
      toCity: toCity.trim(),
      departureTime: departureTime.trim(),
      arrivalTime: arrivalTime.trim(),
      duration: duration.trim(),
      price: typeof price === "string" ? parseInt(price) : price,
      availableSeats:
        typeof availableSeats === "string"
          ? parseInt(availableSeats)
          : availableSeats,
      busType: busType.toLowerCase().trim(),
      amenities: amenities || null,
      createdAt: new Date().toISOString(),
    };

    const newBus = await db.insert(buses).values(insertData).returning();

    return NextResponse.json(newBus[0], { status: 201 });
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
        { error: "Valid ID is required", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    // Check if bus exists
    const existingBus = await db
      .select()
      .from(buses)
      .where(eq(buses.id, parseInt(id)))
      .limit(1);

    if (existingBus.length === 0) {
      return NextResponse.json(
        { error: "Bus not found", code: "BUS_NOT_FOUND" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and prepare updates
    if (body.operator !== undefined) {
      if (typeof body.operator !== "string" || body.operator.trim() === "") {
        return NextResponse.json(
          {
            error: "Operator must be a non-empty string",
            code: "INVALID_OPERATOR",
          },
          { status: 400 }
        );
      }
      updates.operator = body.operator.trim();
    }

    if (body.busNumber !== undefined) {
      if (typeof body.busNumber !== "string" || body.busNumber.trim() === "") {
        return NextResponse.json(
          {
            error: "Bus number must be a non-empty string",
            code: "INVALID_BUS_NUMBER",
          },
          { status: 400 }
        );
      }
      updates.busNumber = body.busNumber.trim();
    }

    if (body.fromCity !== undefined) {
      if (typeof body.fromCity !== "string" || body.fromCity.trim() === "") {
        return NextResponse.json(
          {
            error: "From city must be a non-empty string",
            code: "INVALID_FROM_CITY",
          },
          { status: 400 }
        );
      }
      updates.fromCity = body.fromCity.trim();
    }

    if (body.toCity !== undefined) {
      if (typeof body.toCity !== "string" || body.toCity.trim() === "") {
        return NextResponse.json(
          {
            error: "To city must be a non-empty string",
            code: "INVALID_TO_CITY",
          },
          { status: 400 }
        );
      }
      updates.toCity = body.toCity.trim();
    }

    if (body.departureTime !== undefined) {
      if (
        typeof body.departureTime !== "string" ||
        body.departureTime.trim() === ""
      ) {
        return NextResponse.json(
          {
            error: "Departure time must be a non-empty string",
            code: "INVALID_DEPARTURE_TIME",
          },
          { status: 400 }
        );
      }
      updates.departureTime = body.departureTime.trim();
    }

    if (body.arrivalTime !== undefined) {
      if (
        typeof body.arrivalTime !== "string" ||
        body.arrivalTime.trim() === ""
      ) {
        return NextResponse.json(
          {
            error: "Arrival time must be a non-empty string",
            code: "INVALID_ARRIVAL_TIME",
          },
          { status: 400 }
        );
      }
      updates.arrivalTime = body.arrivalTime.trim();
    }

    if (body.duration !== undefined) {
      if (typeof body.duration !== "string" || body.duration.trim() === "") {
        return NextResponse.json(
          {
            error: "Duration must be a non-empty string",
            code: "INVALID_DURATION",
          },
          { status: 400 }
        );
      }
      updates.duration = body.duration.trim();
    }

    if (body.price !== undefined) {
      if (typeof body.price !== "number" || body.price < 0) {
        return NextResponse.json(
          { error: "Price must be a positive number", code: "INVALID_PRICE" },
          { status: 400 }
        );
      }
      updates.price = parseInt(body.price);
    }

    if (body.availableSeats !== undefined) {
      if (typeof body.availableSeats !== "number" || body.availableSeats < 0) {
        return NextResponse.json(
          {
            error: "Available seats must be a positive number",
            code: "INVALID_AVAILABLE_SEATS",
          },
          { status: 400 }
        );
      }
      updates.availableSeats = parseInt(body.availableSeats);
    }

    if (body.busType !== undefined) {
      const validBusTypes = ["sleeper", "seater", "semi-sleeper"];
      if (!validBusTypes.includes(body.busType.toLowerCase())) {
        return NextResponse.json(
          {
            error: "Bus type must be one of: sleeper, seater, semi-sleeper",
            code: "INVALID_BUS_TYPE",
          },
          { status: 400 }
        );
      }
      updates.busType = body.busType.toLowerCase().trim();
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

    // If no updates provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existingBus[0], { status: 200 });
    }

    const updatedBus = await db
      .update(buses)
      .set(updates)
      .where(eq(buses.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedBus[0], { status: 200 });
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
        { error: "Valid ID is required", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    // Check if bus exists
    const existingBus = await db
      .select()
      .from(buses)
      .where(eq(buses.id, parseInt(id)))
      .limit(1);

    if (existingBus.length === 0) {
      return NextResponse.json(
        { error: "Bus not found", code: "BUS_NOT_FOUND" },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(buses)
      .where(eq(buses.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: "Bus deleted successfully",
        bus: deleted[0],
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
