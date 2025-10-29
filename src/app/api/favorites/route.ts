import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, flights, hotels, buses, activities } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

const VALID_ITEM_TYPES = ["flight", "hotel", "bus", "activity"] as const;
type ItemType = (typeof VALID_ITEM_TYPES)[number];

async function enrichFavoriteWithDetails(favorite: any) {
  let itemDetails = null;

  try {
    switch (favorite.itemType) {
      case "flight":
        const flightResult = await db
          .select()
          .from(flights)
          .where(eq(flights.id, favorite.itemId))
          .limit(1);
        itemDetails = flightResult[0] || null;
        break;

      case "hotel":
        const hotelResult = await db
          .select()
          .from(hotels)
          .where(eq(hotels.id, favorite.itemId))
          .limit(1);
        itemDetails = hotelResult[0] || null;
        break;

      case "bus":
        const busResult = await db
          .select()
          .from(buses)
          .where(eq(buses.id, favorite.itemId))
          .limit(1);
        itemDetails = busResult[0] || null;
        break;

      case "activity":
        const activityResult = await db
          .select()
          .from(activities)
          .where(eq(activities.id, favorite.itemId))
          .limit(1);
        itemDetails = activityResult[0] || null;
        break;
    }
  } catch (error) {
    console.error("Error fetching item details:", error);
  }

  return {
    ...favorite,
    itemDetails,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const favoriteId = parseInt(id);
      if (isNaN(favoriteId)) {
        return NextResponse.json(
          { error: "Valid ID is required", code: "INVALID_ID" },
          { status: 400 }
        );
      }

      const favoriteResult = await db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.id, favoriteId),
            eq(favorites.userId, session.user.id)
          )
        )
        .limit(1);

      if (favoriteResult.length === 0) {
        return NextResponse.json(
          { error: "Favorite not found", code: "NOT_FOUND" },
          { status: 404 }
        );
      }

      const enrichedFavorite = await enrichFavoriteWithDetails(
        favoriteResult[0]
      );
      return NextResponse.json(enrichedFavorite, { status: 200 });
    }

    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, session.user.id))
      .orderBy(desc(favorites.createdAt));

    const enrichedFavorites = await Promise.all(
      userFavorites.map((favorite) => enrichFavoriteWithDetails(favorite))
    );

    return NextResponse.json(enrichedFavorites, { status: 200 });
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
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ("userId" in body || "user_id" in body) {
      return NextResponse.json(
        {
          error: "User ID cannot be provided in request body",
          code: "USER_ID_NOT_ALLOWED",
        },
        { status: 400 }
      );
    }

    const { itemType, itemId } = body;

    if (!itemType) {
      return NextResponse.json(
        { error: "itemType is required", code: "MISSING_ITEM_TYPE" },
        { status: 400 }
      );
    }

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId is required", code: "MISSING_ITEM_ID" },
        { status: 400 }
      );
    }

    const normalizedItemType = itemType.toLowerCase().trim();

    if (!VALID_ITEM_TYPES.includes(normalizedItemType as ItemType)) {
      return NextResponse.json(
        {
          error: `itemType must be one of: ${VALID_ITEM_TYPES.join(", ")}`,
          code: "INVALID_ITEM_TYPE",
        },
        { status: 400 }
      );
    }

    const parsedItemId = parseInt(itemId);
    if (isNaN(parsedItemId) || parsedItemId <= 0) {
      return NextResponse.json(
        { error: "itemId must be a positive integer", code: "INVALID_ITEM_ID" },
        { status: 400 }
      );
    }

    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, session.user.id),
          eq(favorites.itemType, normalizedItemType),
          eq(favorites.itemId, parsedItemId)
        )
      )
      .limit(1);

    if (existingFavorite.length > 0) {
      return NextResponse.json(
        {
          error: "This item is already in your favorites",
          code: "DUPLICATE_FAVORITE",
        },
        { status: 409 }
      );
    }

    const newFavorite = await db
      .insert(favorites)
      .values({
        userId: session.user.id,
        itemType: normalizedItemType,
        itemId: parsedItemId,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const enrichedFavorite = await enrichFavoriteWithDetails(newFavorite[0]);

    return NextResponse.json(enrichedFavorite, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is required", code: "MISSING_ID" },
        { status: 400 }
      );
    }

    const favoriteId = parseInt(id);
    if (isNaN(favoriteId)) {
      return NextResponse.json(
        { error: "Valid ID is required", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(
        and(eq(favorites.id, favoriteId), eq(favorites.userId, session.user.id))
      )
      .limit(1);

    if (existingFavorite.length === 0) {
      return NextResponse.json(
        { error: "Favorite not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(favorites)
      .where(
        and(eq(favorites.id, favoriteId), eq(favorites.userId, session.user.id))
      )
      .returning();

    return NextResponse.json(
      {
        message: "Favorite deleted successfully",
        favorite: deleted[0],
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
