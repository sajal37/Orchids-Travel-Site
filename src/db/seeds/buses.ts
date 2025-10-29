import { db } from "@/db";
import { buses } from "@/db/schema";

async function main() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const sampleBuses = [
    {
      operator: "Greyhound",
      busNumber: "GH-5678",
      fromCity: "New York",
      toCity: "Boston",
      departureTime: new Date(
        today.getTime() + 6 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 10 * 60 * 60 * 1000
      ).toISOString(),
      duration: "4h 0m",
      price: 3500,
      availableSeats: 42,
      busType: "seater",
      amenities: JSON.stringify(["AC", "Charging Points", "Reading Lights"]),
      createdAt: now.toISOString(),
    },
    {
      operator: "Megabus",
      busNumber: "MB-2341",
      fromCity: "Los Angeles",
      toCity: "San Francisco",
      departureTime: new Date(
        today.getTime() + 7 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 14 * 60 * 60 * 1000
      ).toISOString(),
      duration: "7h 0m",
      price: 6500,
      availableSeats: 38,
      busType: "semi-sleeper",
      amenities: JSON.stringify([
        "AC",
        "Reclining Seats",
        "Entertainment System",
        "Charging Points",
        "WiFi",
        "Snacks",
        "Water Bottle",
      ]),
      createdAt: now.toISOString(),
    },
    {
      operator: "National Express",
      busNumber: "NE-8923",
      fromCity: "London",
      toCity: "Manchester",
      departureTime: new Date(
        today.getTime() + 8 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 13 * 60 * 60 * 1000
      ).toISOString(),
      duration: "5h 0m",
      price: 5500,
      availableSeats: 45,
      busType: "seater",
      amenities: JSON.stringify(["AC", "Charging Points", "Reading Lights"]),
      createdAt: now.toISOString(),
    },
    {
      operator: "BlaBlaBus",
      busNumber: "BB-4567",
      fromCity: "Paris",
      toCity: "Lyon",
      departureTime: new Date(
        today.getTime() + 12 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 18 * 60 * 60 * 1000
      ).toISOString(),
      duration: "6h 0m",
      price: 7200,
      availableSeats: 40,
      busType: "semi-sleeper",
      amenities: JSON.stringify([
        "AC",
        "Reclining Seats",
        "Entertainment System",
        "Charging Points",
        "WiFi",
        "Snacks",
        "Water Bottle",
      ]),
      createdAt: now.toISOString(),
    },
    {
      operator: "FlixBus",
      busNumber: "FX-7892",
      fromCity: "Tokyo",
      toCity: "Osaka",
      departureTime: new Date(
        today.getTime() + 6 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 14 * 60 * 60 * 1000
      ).toISOString(),
      duration: "8h 0m",
      price: 8500,
      availableSeats: 35,
      busType: "sleeper",
      amenities: JSON.stringify([
        "AC",
        "Blankets",
        "Charging Points",
        "WiFi",
        "Water Bottle",
        "Pillow",
      ]),
      createdAt: now.toISOString(),
    },
    {
      operator: "Intercity Express",
      busNumber: "IE-3421",
      fromCity: "Seoul",
      toCity: "Busan",
      departureTime: new Date(
        today.getTime() + 7 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 13 * 60 * 60 * 1000
      ).toISOString(),
      duration: "6h 0m",
      price: 6800,
      availableSeats: 48,
      busType: "seater",
      amenities: JSON.stringify(["AC", "Charging Points", "Reading Lights"]),
      createdAt: now.toISOString(),
    },
    {
      operator: "Premier Coach",
      busNumber: "PC-9876",
      fromCity: "Dubai",
      toCity: "Abu Dhabi",
      departureTime: new Date(
        today.getTime() + 14 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 16 * 60 * 60 * 1000
      ).toISOString(),
      duration: "2h 0m",
      price: 2500,
      availableSeats: 50,
      busType: "seater",
      amenities: JSON.stringify(["AC", "Charging Points", "Reading Lights"]),
      createdAt: now.toISOString(),
    },
    {
      operator: "Greyhound",
      busNumber: "GH-1234",
      fromCity: "Singapore",
      toCity: "Kuala Lumpur",
      departureTime: new Date(
        today.getTime() + 22 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 32 * 60 * 60 * 1000
      ).toISOString(),
      duration: "10h 0m",
      price: 11500,
      availableSeats: 32,
      busType: "sleeper",
      amenities: JSON.stringify([
        "AC",
        "Blankets",
        "Charging Points",
        "WiFi",
        "Water Bottle",
        "Pillow",
      ]),
      createdAt: now.toISOString(),
    },
    {
      operator: "RedCoach",
      busNumber: "RC-5543",
      fromCity: "Sydney",
      toCity: "Melbourne",
      departureTime: new Date(
        today.getTime() + 20 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 32 * 60 * 60 * 1000
      ).toISOString(),
      duration: "12h 0m",
      price: 13200,
      availableSeats: 30,
      busType: "sleeper",
      amenities: JSON.stringify([
        "AC",
        "Blankets",
        "Charging Points",
        "WiFi",
        "Water Bottle",
        "Pillow",
      ]),
      createdAt: now.toISOString(),
    },
    {
      operator: "National Express",
      busNumber: "NE-6677",
      fromCity: "Mumbai",
      toCity: "Pune",
      departureTime: new Date(
        today.getTime() + 6 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString(),
      duration: "3h 0m",
      price: 2800,
      availableSeats: 44,
      busType: "seater",
      amenities: JSON.stringify(["AC", "Charging Points", "Reading Lights"]),
      createdAt: now.toISOString(),
    },
    {
      operator: "Peter Pan Bus",
      busNumber: "PP-8821",
      fromCity: "Bangkok",
      toCity: "Pattaya",
      departureTime: new Date(
        today.getTime() + 13 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 16 * 60 * 60 * 1000
      ).toISOString(),
      duration: "3h 0m",
      price: 3200,
      availableSeats: 47,
      busType: "seater",
      amenities: JSON.stringify(["AC", "Charging Points", "Reading Lights"]),
      createdAt: now.toISOString(),
    },
    {
      operator: "Megabus",
      busNumber: "MB-7755",
      fromCity: "Toronto",
      toCity: "Montreal",
      departureTime: new Date(
        today.getTime() + 8 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 14 * 60 * 60 * 1000
      ).toISOString(),
      duration: "6h 0m",
      price: 6200,
      availableSeats: 41,
      busType: "semi-sleeper",
      amenities: JSON.stringify([
        "AC",
        "Reclining Seats",
        "Entertainment System",
        "Charging Points",
        "WiFi",
        "Snacks",
        "Water Bottle",
      ]),
      createdAt: now.toISOString(),
    },
    {
      operator: "FlixBus",
      busNumber: "FX-3344",
      fromCity: "Berlin",
      toCity: "Hamburg",
      departureTime: new Date(
        today.getTime() + 12 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 17 * 60 * 60 * 1000
      ).toISOString(),
      duration: "5h 0m",
      price: 5800,
      availableSeats: 39,
      busType: "seater",
      amenities: JSON.stringify(["AC", "Charging Points", "Reading Lights"]),
      createdAt: now.toISOString(),
    },
    {
      operator: "BlaBlaBus",
      busNumber: "BB-9988",
      fromCity: "Barcelona",
      toCity: "Madrid",
      departureTime: new Date(
        today.getTime() + 18 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 28 * 60 * 60 * 1000
      ).toISOString(),
      duration: "10h 0m",
      price: 10500,
      availableSeats: 34,
      busType: "sleeper",
      amenities: JSON.stringify([
        "AC",
        "Blankets",
        "Charging Points",
        "WiFi",
        "Water Bottle",
        "Pillow",
      ]),
      createdAt: now.toISOString(),
    },
    {
      operator: "Bolt Bus",
      busNumber: "BB-2255",
      fromCity: "Chicago",
      toCity: "Detroit",
      departureTime: new Date(
        today.getTime() + 15 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 21 * 60 * 60 * 1000
      ).toISOString(),
      duration: "6h 0m",
      price: 6700,
      availableSeats: 43,
      busType: "semi-sleeper",
      amenities: JSON.stringify([
        "AC",
        "Reclining Seats",
        "Entertainment System",
        "Charging Points",
        "WiFi",
        "Snacks",
        "Water Bottle",
      ]),
      createdAt: now.toISOString(),
    },
    {
      operator: "FlixBus",
      busNumber: "FX-4466",
      fromCity: "Amsterdam",
      toCity: "Brussels",
      departureTime: new Date(
        today.getTime() + 9 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 12 * 60 * 60 * 1000
      ).toISOString(),
      duration: "3h 0m",
      price: 3800,
      availableSeats: 46,
      busType: "seater",
      amenities: JSON.stringify(["AC", "Charging Points", "Reading Lights"]),
      createdAt: now.toISOString(),
    },
    {
      operator: "Intercity Express",
      busNumber: "IE-7799",
      fromCity: "Hong Kong",
      toCity: "Shenzhen",
      departureTime: new Date(
        today.getTime() + 14 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 16 * 60 * 60 * 1000
      ).toISOString(),
      duration: "2h 0m",
      price: 2200,
      availableSeats: 52,
      busType: "seater",
      amenities: JSON.stringify(["AC", "Charging Points", "Reading Lights"]),
      createdAt: now.toISOString(),
    },
    {
      operator: "Premier Coach",
      busNumber: "PC-1122",
      fromCity: "Auckland",
      toCity: "Wellington",
      departureTime: new Date(
        today.getTime() + 19 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        today.getTime() + 33 * 60 * 60 * 1000
      ).toISOString(),
      duration: "14h 0m",
      price: 14800,
      availableSeats: 31,
      busType: "sleeper",
      amenities: JSON.stringify([
        "AC",
        "Blankets",
        "Charging Points",
        "WiFi",
        "Water Bottle",
        "Pillow",
      ]),
      createdAt: now.toISOString(),
    },
  ];

  await db.insert(buses).values(sampleBuses);

  console.log("✅ Bus routes seeder completed successfully");
}

main().catch((error) => {
  console.error("❌ Seeder failed:", error);
});
