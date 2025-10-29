import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { flights, hotels, buses, activities } from "@/db/schema";
import {
  mockFlights,
  mockHotels,
  mockBuses,
  mockActivities,
} from "@/lib/mockData";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetType, targetId, naturalLanguageCommand, userId } = body;

    if (!targetType || !targetId || !naturalLanguageCommand) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["flight", "hotel", "bus", "activity"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid target type" },
        { status: 400 }
      );
    }

    // Fetch item: try DB when targetId is numeric, otherwise fall back to mock data
    let originalItem: any;
    const idNum = Number.parseInt(String(targetId), 10);

    switch (targetType) {
      case "flight":
        if (Number.isFinite(idNum)) {
          [originalItem] = await db
            .select()
            .from(flights)
            .where(eq(flights.id, idNum));
        }
        if (!originalItem) {
          originalItem = mockFlights.find((f) => f.id === String(targetId));
        }
        break;
      case "hotel":
        if (Number.isFinite(idNum)) {
          [originalItem] = await db
            .select()
            .from(hotels)
            .where(eq(hotels.id, idNum));
        }
        if (!originalItem) {
          originalItem = mockHotels.find((h) => h.id === String(targetId));
        }
        break;
      case "bus":
        if (Number.isFinite(idNum)) {
          [originalItem] = await db
            .select()
            .from(buses)
            .where(eq(buses.id, idNum));
        }
        if (!originalItem) {
          originalItem = mockBuses.find((b) => b.id === String(targetId));
        }
        break;
      case "activity":
        if (Number.isFinite(idNum)) {
          [originalItem] = await db
            .select()
            .from(activities)
            .where(eq(activities.id, idNum));
        }
        if (!originalItem) {
          originalItem = mockActivities.find((a) => a.id === String(targetId));
        }
        break;
      default:
        return NextResponse.json(
          { error: "Invalid target type" },
          { status: 400 }
        );
    }

    if (!originalItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Parse natural language command and generate proposed changes
    const proposedChanges = parseNaturalLanguageCommand(
      naturalLanguageCommand,
      originalItem,
      targetType
    );

    if (Object.keys(proposedChanges).length === 0) {
      return NextResponse.json(
        {
          error: "Could not parse command",
          message:
            "No valid changes detected from the natural language command",
        },
        { status: 400 }
      );
    }

    const edit = {
      id: `EDIT_${Date.now()}_${targetId}`,
      targetType,
      targetId: Number.isFinite(idNum) ? idNum : String(targetId),
      originalContent: originalItem,
      proposedContent: { ...originalItem, ...proposedChanges },
      description: naturalLanguageCommand,
      status: "preview",
      createdBy: userId || "anonymous",
      createdAt: new Date().toISOString(),
      changes: Object.keys(proposedChanges),
      changedFields: proposedChanges,
    };

    return NextResponse.json({
      success: true,
      data: edit,
      message:
        "Preview generated successfully. Review changes before applying.",
    });
  } catch (error) {
    console.error("AI content edit error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { editId, targetType, targetId, changedFields, action, userId } =
      body;

    if (!editId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["apply", "rollback", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "apply") {
      if (!targetType || !targetId || !changedFields) {
        return NextResponse.json(
          { error: "Missing fields for apply action" },
          { status: 400 }
        );
      }

      // Apply changes to REAL database
      let result: any;
      const id = parseInt(targetId);

      switch (targetType) {
        case "flight":
          result = await db
            .update(flights)
            .set(changedFields)
            .where(eq(flights.id, id))
            .returning();
          break;
        case "hotel":
          result = await db
            .update(hotels)
            .set(changedFields)
            .where(eq(hotels.id, id))
            .returning();
          break;
        case "bus":
          result = await db
            .update(buses)
            .set(changedFields)
            .where(eq(buses.id, id))
            .returning();
          break;
        case "activity":
          result = await db
            .update(activities)
            .set(changedFields)
            .where(eq(activities.id, id))
            .returning();
          break;
        default:
          return NextResponse.json(
            { error: "Invalid target type" },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        message: "Changes applied successfully to database",
        data: {
          editId,
          action: "applied",
          appliedBy: userId || "anonymous",
          appliedAt: new Date().toISOString(),
          updatedItem: result[0],
        },
      });
    } else if (action === "reject") {
      return NextResponse.json({
        success: true,
        message: "Changes rejected. No modifications made.",
        data: {
          editId,
          action: "rejected",
          rejectedBy: userId || "anonymous",
          rejectedAt: new Date().toISOString(),
        },
      });
    } else if (action === "rollback") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Rollback requires original data. Please implement versioning for full rollback support.",
        },
        { status: 501 }
      );
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("AI content edit action error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Parse natural language commands to database field updates
function parseNaturalLanguageCommand(
  command: string,
  originalItem: any,
  targetType: string
): any {
  const cmd = command.toLowerCase();
  const changes: any = {};

  // Price changes
  if (cmd.includes("increase price") || cmd.includes("raise price")) {
    const match = cmd.match(/by\s+(\d+)|(\d+)/);
    const amount = match ? parseInt(match[1] || match[2]) : 1000;
    const priceField =
      originalItem.price !== undefined ? "price" : "pricePerNight";
    changes[priceField] = originalItem[priceField] + amount;
  } else if (
    cmd.includes("decrease price") ||
    cmd.includes("reduce price") ||
    cmd.includes("lower price")
  ) {
    const match = cmd.match(/by\s+(\d+)|(\d+)/);
    const amount = match ? parseInt(match[1] || match[2]) : 1000;
    const priceField =
      originalItem.price !== undefined ? "price" : "pricePerNight";
    changes[priceField] = Math.max(100, originalItem[priceField] - amount);
  } else if (cmd.includes("set price to") || cmd.includes("change price to")) {
    const match = cmd.match(/to\s+(\d+)/);
    if (match) {
      const priceField =
        originalItem.price !== undefined ? "price" : "pricePerNight";
      changes[priceField] = parseInt(match[1]);
    }
  }

  // Seat/room availability changes
  if (
    cmd.includes("add") &&
    (cmd.includes("seat") || cmd.includes("room") || cmd.includes("spot"))
  ) {
    const match = cmd.match(/add\s+(\d+)/);
    const amount = match ? parseInt(match[1]) : 5;

    if (targetType === "flight" || targetType === "bus") {
      const seatsField = Object.prototype.hasOwnProperty.call(
        originalItem,
        "seats"
      )
        ? "seats"
        : "availableSeats";
      changes[seatsField] = (originalItem[seatsField] || 0) + amount;
    } else if (targetType === "hotel") {
      changes.availableRooms = (originalItem.availableRooms || 0) + amount;
    } else if (targetType === "activity") {
      changes.availableSpots = (originalItem.availableSpots || 0) + amount;
    }
  } else if (
    cmd.includes("remove") &&
    (cmd.includes("seat") || cmd.includes("room") || cmd.includes("spot"))
  ) {
    const match = cmd.match(/remove\s+(\d+)/);
    const amount = match ? parseInt(match[1]) : 5;

    if (targetType === "flight" || targetType === "bus") {
      const seatsField = Object.prototype.hasOwnProperty.call(
        originalItem,
        "seats"
      )
        ? "seats"
        : "availableSeats";
      changes[seatsField] = Math.max(
        0,
        (originalItem[seatsField] || 0) - amount
      );
    } else if (targetType === "hotel") {
      changes.availableRooms = Math.max(
        0,
        (originalItem.availableRooms || 0) - amount
      );
    } else if (targetType === "activity") {
      changes.availableSpots = Math.max(
        0,
        (originalItem.availableSpots || 0) - amount
      );
    }
  }

  // Rating changes
  if (cmd.includes("set rating to") || cmd.includes("change rating to")) {
    const match = cmd.match(/to\s+([\d.]+)/);
    if (match && originalItem.rating !== undefined) {
      const newRating = parseFloat(match[1]);
      if (newRating >= 0 && newRating <= 5) {
        changes.rating = newRating;
      }
    }
  }

  // Meal included toggle (for flights)
  if (targetType === "flight") {
    if (cmd.includes("include meal") || cmd.includes("add meal")) {
      changes.mealIncluded = true;
    } else if (cmd.includes("remove meal") || cmd.includes("exclude meal")) {
      changes.mealIncluded = false;
    }
  }

  // Class type changes (for flights)
  if (targetType === "flight") {
    if (
      cmd.includes("upgrade to business") ||
      cmd.includes("change to business")
    ) {
      changes.classType = "business";
    } else if (
      cmd.includes("downgrade to economy") ||
      cmd.includes("change to economy")
    ) {
      changes.classType = "economy";
    }
  }

  // Bus type changes
  if (targetType === "bus") {
    if (
      cmd.includes("change to sleeper") ||
      cmd.includes("upgrade to sleeper")
    ) {
      changes.busType = "sleeper";
    } else if (cmd.includes("change to ac") || cmd.includes("make it ac")) {
      changes.busType = "ac";
    }
  }

  return changes;
}
