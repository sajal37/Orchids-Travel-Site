import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { flights, hotels, buses, activities } from "./schema";

/**
 * Create a test database client
 * Uses an in-memory SQLite database for fast, isolated testing
 */
export function createTestDb() {
  const client = createClient({
    url: "file::memory:?cache=shared",
  });

  return drizzle(client, { schema });
}

/**
 * Seed test database with sample data
 */
export async function seedTestDb(db: ReturnType<typeof createTestDb>) {
  const now = new Date().toISOString();

  // Seed flights
  await db.insert(flights).values([
    {
      airline: "Test Airlines",
      flightNumber: "TA001",
      fromCity: "Mumbai",
      toCity: "Delhi",
      departureTime: "2024-03-15T10:00:00Z",
      arrivalTime: "2024-03-15T12:30:00Z",
      duration: "2h 30m",
      price: 5000,
      availableSeats: 50,
      classType: "economy",
      baggageAllowance: "20kg",
      mealIncluded: true,
      createdAt: now,
    },
  ]);

  // Seed hotels
  await db.insert(hotels).values([
    {
      name: "Test Hotel",
      location: "Colaba",
      city: "Mumbai",
      rating: 4.5,
      pricePerNight: 3000,
      availableRooms: 10,
      amenities: ["WiFi", "Pool", "Gym"],
      roomType: "Deluxe",
      checkIn: "14:00",
      checkOut: "11:00",
      images: ["https://example.com/hotel.jpg"],
      createdAt: now,
    },
  ]);

  // Seed buses
  await db.insert(buses).values([
    {
      operator: "Test Bus",
      busNumber: "TB001",
      fromCity: "Mumbai",
      toCity: "Pune",
      departureTime: "2024-03-15T08:00:00Z",
      arrivalTime: "2024-03-15T11:00:00Z",
      duration: "3h",
      price: 500,
      availableSeats: 40,
      busType: "AC Sleeper",
      amenities: ["AC", "WiFi"],
      createdAt: now,
    },
  ]);

  // Seed activities
  await db.insert(activities).values([
    {
      title: "City Tour",
      location: "Gateway of India",
      city: "Mumbai",
      category: "Sightseeing",
      price: 1000,
      duration: "4h",
      rating: 4.7,
      maxParticipants: 30,
      availableSpots: 20,
      description: "Explore the city",
      includes: ["Guide", "Transport"],
      images: ["https://example.com/activity.jpg"],
      createdAt: now,
    },
  ]);
}

/**
 * Clean up test database
 */
export async function cleanupTestDb(db: ReturnType<typeof createTestDb>) {
  await db.delete(flights);
  await db.delete(hotels);
  await db.delete(buses);
  await db.delete(activities);
}
