import { db } from "@/db";
import { flights } from "@/db/schema";

async function main() {
  const currentDate = new Date();

  const sampleFlights = [
    {
      airline: "United Airlines",
      flightNumber: "UA-123",
      fromCity: "New York (JFK)",
      toCity: "Los Angeles (LAX)",
      departureTime: new Date(
        currentDate.getTime() + 8 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 14 * 60 * 60 * 1000
      ).toISOString(),
      duration: "6h 0m",
      price: 45000,
      availableSeats: 120,
      classType: "economy",
      baggageAllowance: "15 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "British Airways",
      flightNumber: "BA-234",
      fromCity: "London (LHR)",
      toCity: "Paris (CDG)",
      departureTime: new Date(
        currentDate.getTime() + 5 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 6.5 * 60 * 60 * 1000
      ).toISOString(),
      duration: "1h 30m",
      price: 25000,
      availableSeats: 85,
      classType: "economy",
      baggageAllowance: "15 kg",
      mealIncluded: false,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "Japan Airlines",
      flightNumber: "JL-567",
      fromCity: "Tokyo (NRT)",
      toCity: "Seoul (ICN)",
      departureTime: new Date(
        currentDate.getTime() + 10 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 12.5 * 60 * 60 * 1000
      ).toISOString(),
      duration: "2h 30m",
      price: 95000,
      availableSeats: 45,
      classType: "business",
      baggageAllowance: "30 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "Emirates",
      flightNumber: "EK-789",
      fromCity: "Dubai (DXB)",
      toCity: "London (LHR)",
      departureTime: new Date(
        currentDate.getTime() + 15 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 22 * 60 * 60 * 1000
      ).toISOString(),
      duration: "7h 0m",
      price: 175000,
      availableSeats: 20,
      classType: "first",
      baggageAllowance: "40 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "United Airlines",
      flightNumber: "UA-456",
      fromCity: "San Francisco (SFO)",
      toCity: "Tokyo (NRT)",
      departureTime: new Date(
        currentDate.getTime() + 12 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 23 * 60 * 60 * 1000
      ).toISOString(),
      duration: "11h 0m",
      price: 72000,
      availableSeats: 95,
      classType: "economy",
      baggageAllowance: "15 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "Delta Air Lines",
      flightNumber: "DL-890",
      fromCity: "New York (JFK)",
      toCity: "London (LHR)",
      departureTime: new Date(
        currentDate.getTime() + 18 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 25 * 60 * 60 * 1000
      ).toISOString(),
      duration: "7h 0m",
      price: 125000,
      availableSeats: 35,
      classType: "business",
      baggageAllowance: "30 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "Japan Airlines",
      flightNumber: "JL-234",
      fromCity: "Los Angeles (LAX)",
      toCity: "Tokyo (NRT)",
      departureTime: new Date(
        currentDate.getTime() + 20 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 31 * 60 * 60 * 1000
      ).toISOString(),
      duration: "11h 0m",
      price: 68000,
      availableSeats: 110,
      classType: "economy",
      baggageAllowance: "15 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "Air France",
      flightNumber: "AF-567",
      fromCity: "Paris (CDG)",
      toCity: "Dubai (DXB)",
      departureTime: new Date(
        currentDate.getTime() + 9 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 16 * 60 * 60 * 1000
      ).toISOString(),
      duration: "7h 0m",
      price: 190000,
      availableSeats: 18,
      classType: "first",
      baggageAllowance: "40 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "United Airlines",
      flightNumber: "UA-789",
      fromCity: "Seoul (ICN)",
      toCity: "San Francisco (SFO)",
      departureTime: new Date(
        currentDate.getTime() + 14 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 25 * 60 * 60 * 1000
      ).toISOString(),
      duration: "11h 0m",
      price: 105000,
      availableSeats: 42,
      classType: "business",
      baggageAllowance: "30 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "Singapore Airlines",
      flightNumber: "SQ-123",
      fromCity: "Singapore (SIN)",
      toCity: "Sydney (SYD)",
      departureTime: new Date(
        currentDate.getTime() + 6 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 14 * 60 * 60 * 1000
      ).toISOString(),
      duration: "8h 0m",
      price: 58000,
      availableSeats: 90,
      classType: "economy",
      baggageAllowance: "15 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "Emirates",
      flightNumber: "EK-456",
      fromCity: "Mumbai (BOM)",
      toCity: "Dubai (DXB)",
      departureTime: new Date(
        currentDate.getTime() + 7 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 10.5 * 60 * 60 * 1000
      ).toISOString(),
      duration: "3h 30m",
      price: 35000,
      availableSeats: 130,
      classType: "economy",
      baggageAllowance: "15 kg",
      mealIncluded: false,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "Thai Airways",
      flightNumber: "TG-789",
      fromCity: "Bangkok (BKK)",
      toCity: "Singapore (SIN)",
      departureTime: new Date(
        currentDate.getTime() + 11 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 13.5 * 60 * 60 * 1000
      ).toISOString(),
      duration: "2h 30m",
      price: 28000,
      availableSeats: 75,
      classType: "economy",
      baggageAllowance: "15 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "Air Canada",
      flightNumber: "AC-234",
      fromCity: "Toronto (YYZ)",
      toCity: "New York (JFK)",
      departureTime: new Date(
        currentDate.getTime() + 4 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 5.5 * 60 * 60 * 1000
      ).toISOString(),
      duration: "1h 30m",
      price: 22000,
      availableSeats: 100,
      classType: "economy",
      baggageAllowance: "15 kg",
      mealIncluded: false,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "Lufthansa",
      flightNumber: "LH-567",
      fromCity: "Berlin (BER)",
      toCity: "Rome (FCO)",
      departureTime: new Date(
        currentDate.getTime() + 8 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 10 * 60 * 60 * 1000
      ).toISOString(),
      duration: "2h 0m",
      price: 110000,
      availableSeats: 38,
      classType: "business",
      baggageAllowance: "30 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "United Airlines",
      flightNumber: "UA-678",
      fromCity: "Chicago (ORD)",
      toCity: "Miami (MIA)",
      departureTime: new Date(
        currentDate.getTime() + 13 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 16 * 60 * 60 * 1000
      ).toISOString(),
      duration: "3h 0m",
      price: 32000,
      availableSeats: 105,
      classType: "economy",
      baggageAllowance: "15 kg",
      mealIncluded: false,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "KLM",
      flightNumber: "KL-890",
      fromCity: "Amsterdam (AMS)",
      toCity: "Barcelona (BCN)",
      departureTime: new Date(
        currentDate.getTime() + 16 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 18.5 * 60 * 60 * 1000
      ).toISOString(),
      duration: "2h 30m",
      price: 140000,
      availableSeats: 30,
      classType: "business",
      baggageAllowance: "30 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "Cathay Pacific",
      flightNumber: "CX-345",
      fromCity: "Hong Kong (HKG)",
      toCity: "Bangkok (BKK)",
      departureTime: new Date(
        currentDate.getTime() + 19 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 22 * 60 * 60 * 1000
      ).toISOString(),
      duration: "3h 0m",
      price: 42000,
      availableSeats: 88,
      classType: "economy",
      baggageAllowance: "15 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
    {
      airline: "Qantas",
      flightNumber: "QF-678",
      fromCity: "Sydney (SYD)",
      toCity: "Auckland (AKL)",
      departureTime: new Date(
        currentDate.getTime() + 21 * 60 * 60 * 1000
      ).toISOString(),
      arrivalTime: new Date(
        currentDate.getTime() + 24.5 * 60 * 60 * 1000
      ).toISOString(),
      duration: "3h 30m",
      price: 165000,
      availableSeats: 24,
      classType: "first",
      baggageAllowance: "40 kg",
      mealIncluded: true,
      createdAt: currentDate.toISOString(),
    },
  ];

  await db.insert(flights).values(sampleFlights);

  console.log("✅ Flights seeder completed successfully");
}

main().catch((error) => {
  console.error("❌ Seeder failed:", error);
});
