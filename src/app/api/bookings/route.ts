import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, flights, hotels, buses, activities } from "@/db/schema";
import { eq, like, or, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { paymentService } from "@/lib/payments";

export async function GET(request: NextRequest) {
  try {
    // Authentication check - require bearer token
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: "Valid ID is required", code: "INVALID_ID" },
          { status: 400 }
        );
      }

      const booking = await db
        .select()
        .from(bookings)
        .where(and(eq(bookings.id, parseInt(id)), eq(bookings.userId, userId)))
        .limit(1);

      if (booking.length === 0) {
        return NextResponse.json(
          { error: "Booking not found", code: "NOT_FOUND" },
          { status: 404 }
        );
      }

      // Fetch related travel item details
      const enrichedBooking = await enrichBookingWithDetails(booking[0]);

      return NextResponse.json(enrichedBooking, { status: 200 });
    }

    // List with filtering and sorting
    const conditions = [eq(bookings.userId, userId)];

    // Filter by status if provided
    if (status && status !== "all") {
      const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
      if (validStatuses.includes(status.toLowerCase())) {
        conditions.push(eq(bookings.status, status.toLowerCase()));
      }
    }

    const userBookings = await db
      .select()
      .from(bookings)
      .where(and(...conditions))
      .orderBy(desc(bookings.bookingDate));

    // Enrich all bookings with related item details
    const enrichedBookings = await Promise.all(
      userBookings.map((booking) => enrichBookingWithDetails(booking))
    );

    return NextResponse.json(enrichedBookings, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error },
      { status: 500 }
    );
  }
}

// Helper function to enrich booking with related item details
async function enrichBookingWithDetails(booking: any) {
  let itemDetails = null;

  try {
    switch (booking.bookingType) {
      case "flight":
        const flightData = await db
          .select()
          .from(flights)
          .where(eq(flights.id, booking.itemId))
          .limit(1);
        itemDetails = flightData[0] || null;
        break;

      case "hotel":
        const hotelData = await db
          .select()
          .from(hotels)
          .where(eq(hotels.id, booking.itemId))
          .limit(1);
        itemDetails = hotelData[0] || null;
        break;

      case "bus":
        const busData = await db
          .select()
          .from(buses)
          .where(eq(buses.id, booking.itemId))
          .limit(1);
        itemDetails = busData[0] || null;
        break;

      case "activity":
        const activityData = await db
          .select()
          .from(activities)
          .where(eq(activities.id, booking.itemId))
          .limit(1);
        itemDetails = activityData[0] || null;
        break;

      default:
        itemDetails = null;
    }
  } catch (error) {
    console.error("Error fetching item details:", error);
    itemDetails = null;
  }

  return {
    ...booking,
    itemDetails,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const {
      bookingType,
      itemId,
      totalAmount,
      travelDate,
      status,
      paymentStatus,
      bookingDetails,
      passengers,
      paymentData, // New field for payment processing
    } = body;

    // Validate required fields
    if (!bookingType) {
      return NextResponse.json(
        { error: "Booking type is required", code: "MISSING_BOOKING_TYPE" },
        { status: 400 }
      );
    }

    // Validate booking type enum
    const validBookingTypes = ["flight", "hotel", "bus", "activity"];
    if (!validBookingTypes.includes(bookingType.toLowerCase())) {
      return NextResponse.json(
        {
          error: "Booking type must be flight, hotel, bus, or activity",
          code: "INVALID_BOOKING_TYPE",
        },
        { status: 400 }
      );
    }

    if (itemId === undefined || itemId === null) {
      return NextResponse.json(
        { error: "Item ID is required", code: "MISSING_ITEM_ID" },
        { status: 400 }
      );
    }

    if (totalAmount === undefined || totalAmount === null) {
      return NextResponse.json(
        { error: "Total amount is required", code: "MISSING_TOTAL_AMOUNT" },
        { status: 400 }
      );
    }

    if (typeof totalAmount !== "number" || totalAmount < 0) {
      return NextResponse.json(
        {
          error: "Total amount must be a positive number",
          code: "INVALID_TOTAL_AMOUNT",
        },
        { status: 400 }
      );
    }

    if (!travelDate) {
      return NextResponse.json(
        { error: "Travel date is required", code: "MISSING_TRAVEL_DATE" },
        { status: 400 }
      );
    }

    // Validate JSON fields if provided
    if (bookingDetails !== undefined && bookingDetails !== null) {
      if (typeof bookingDetails !== "object") {
        return NextResponse.json(
          {
            error: "Booking details must be an object",
            code: "INVALID_BOOKING_DETAILS",
          },
          { status: 400 }
        );
      }
    }

    if (passengers !== undefined && passengers !== null) {
      if (!Array.isArray(passengers)) {
        return NextResponse.json(
          { error: "Passengers must be an array", code: "INVALID_PASSENGERS" },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
      if (!validStatuses.includes(status.toLowerCase())) {
        return NextResponse.json(
          {
            error: "Status must be pending, confirmed, cancelled, or completed",
            code: "INVALID_STATUS",
          },
          { status: 400 }
        );
      }
    }

    // Validate payment status if provided
    if (paymentStatus) {
      const validPaymentStatuses = ["pending", "paid", "refunded", "failed"];
      if (!validPaymentStatuses.includes(paymentStatus.toLowerCase())) {
        return NextResponse.json(
          {
            error: "Payment status must be pending, paid, refunded, or failed",
            code: "INVALID_PAYMENT_STATUS",
          },
          { status: 400 }
        );
      }
    }

    // Process payment if payment data is provided
    let transactionId: string | undefined;
    let finalPaymentStatus = paymentStatus || "pending";
    
    if (paymentData) {
      const paymentResult = await paymentService.processPayment(paymentData, userId);
      if (!paymentResult.success) {
        return NextResponse.json(
          { 
            error: "Payment processing failed: " + paymentResult.error,
            code: "PAYMENT_FAILED"
          },
          { status: 400 }
        );
      }
      transactionId = paymentResult.transactionId;
      finalPaymentStatus = "paid";
    }

    // Create new booking with authenticated userId
    const newBooking = await db
      .insert(bookings)
      .values({
        userId: userId,
        bookingType: bookingType.toLowerCase().trim(),
        itemId: Number(itemId),
        totalAmount: Number(totalAmount),
        travelDate: travelDate.trim(),
        status: status ? status.toLowerCase().trim() : "pending",
        paymentStatus: finalPaymentStatus,
        bookingDate: new Date().toISOString(),
        bookingDetails: bookingDetails || null,
        passengers: passengers || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newBooking[0], { status: 201 });
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
    // Authentication check
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid ID is required", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    // Check if booking exists and belongs to user
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, parseInt(id)), eq(bookings.userId, userId)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: "Booking not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and prepare updates
    if (body.status !== undefined) {
      const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
      if (!validStatuses.includes(body.status.toLowerCase())) {
        return NextResponse.json(
          {
            error: "Status must be pending, confirmed, cancelled, or completed",
            code: "INVALID_STATUS",
          },
          { status: 400 }
        );
      }
      updates.status = body.status.toLowerCase().trim();
    }

    if (body.paymentStatus !== undefined) {
      const validPaymentStatuses = ["pending", "paid", "refunded", "failed"];
      if (!validPaymentStatuses.includes(body.paymentStatus.toLowerCase())) {
        return NextResponse.json(
          {
            error: "Payment status must be pending, paid, refunded, or failed",
            code: "INVALID_PAYMENT_STATUS",
          },
          { status: 400 }
        );
      }
      updates.paymentStatus = body.paymentStatus.toLowerCase().trim();
    }

    if (body.bookingDetails !== undefined) {
      if (
        body.bookingDetails !== null &&
        typeof body.bookingDetails !== "object"
      ) {
        return NextResponse.json(
          {
            error: "Booking details must be an object or null",
            code: "INVALID_BOOKING_DETAILS",
          },
          { status: 400 }
        );
      }
      updates.bookingDetails = body.bookingDetails;
    }

    if (body.passengers !== undefined) {
      if (body.passengers !== null && !Array.isArray(body.passengers)) {
        return NextResponse.json(
          {
            error: "Passengers must be an array or null",
            code: "INVALID_PASSENGERS",
          },
          { status: 400 }
        );
      }
      updates.passengers = body.passengers;
    }

    if (body.travelDate !== undefined) {
      updates.travelDate = body.travelDate.trim();
    }

    // If no updates provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existingBooking[0], { status: 200 });
    }

    const updatedBooking = await db
      .update(bookings)
      .set(updates)
      .where(and(eq(bookings.id, parseInt(id)), eq(bookings.userId, userId)))
      .returning();

    return NextResponse.json(updatedBooking[0], { status: 200 });
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
    // Authentication check
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid ID is required", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    // Check if booking exists and belongs to user
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, parseInt(id)), eq(bookings.userId, userId)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: "Booking not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // If booking is paid, process refund
    if (existingBooking[0].paymentStatus === "paid") {
      // In a real implementation, you would process a refund here
      // For now, we'll just log that a refund would be needed
      console.log("Refund would be processed for booking:", id);
    }

    const deleted = await db
      .delete(bookings)
      .where(and(eq(bookings.id, parseInt(id)), eq(bookings.userId, userId)))
      .returning();

    return NextResponse.json(
      {
        message: "Booking deleted successfully",
        booking: deleted[0],
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