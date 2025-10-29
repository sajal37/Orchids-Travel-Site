import { db } from "@/db";
import { bookings } from "@/db/schema";

async function main() {
  const now = new Date();
  const fiveDaysAgo = new Date(now);
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const fifteenDaysAgo = new Date(now);
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
  const tenDaysAgo = new Date(now);
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const fiveDaysFromNow = new Date(now);
  fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const tenDaysFromNow = new Date(now);
  tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
  const twoDaysFromNow = new Date(now);
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

  const sampleBookings = [
    {
      userId: "test-user-1",
      bookingType: "flight",
      itemId: 1,
      status: "confirmed",
      totalAmount: 900000,
      paymentStatus: "paid",
      bookingDate: now.toISOString(),
      travelDate: sevenDaysFromNow.toISOString(),
      passengers: [
        { name: "Rajesh Kumar", age: 35, gender: "Male" },
        { name: "Priya Kumar", age: 32, gender: "Female" },
      ],
      bookingDetails: {
        airline: "Air India",
        flightNumber: "AI-302",
        fromCity: "Delhi",
        toCity: "Mumbai",
        departureTime: "08:30 AM",
        arrivalTime: "10:45 AM",
        duration: "2h 15m",
        classType: "Economy",
        baggageAllowance: "15 kg",
        mealIncluded: true,
        seatNumbers: ["12A", "12B"],
      },
      createdAt: now.toISOString(),
    },
    {
      userId: "test-user-1",
      bookingType: "hotel",
      itemId: 2,
      status: "confirmed",
      totalAmount: 3100000,
      paymentStatus: "paid",
      bookingDate: now.toISOString(),
      travelDate: tenDaysFromNow.toISOString(),
      passengers: [
        { name: "Amit Sharma", age: 40, gender: "Male" },
        { name: "Sunita Sharma", age: 38, gender: "Female" },
      ],
      bookingDetails: {
        hotelName: "The Taj Palace",
        location: "Colaba, Mumbai",
        roomType: "Deluxe Suite",
        nights: 2,
        checkIn: tenDaysFromNow.toISOString(),
        checkOut: new Date(
          tenDaysFromNow.getTime() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        roomNumber: "305",
        amenities: ["WiFi", "Breakfast", "Pool", "Spa", "Gym"],
        pricePerNight: 1550000,
      },
      createdAt: now.toISOString(),
    },
    {
      userId: "test-user-1",
      bookingType: "bus",
      itemId: 3,
      status: "pending",
      totalAmount: 360000,
      paymentStatus: "pending",
      bookingDate: now.toISOString(),
      travelDate: fiveDaysFromNow.toISOString(),
      passengers: [
        { name: "Vikram Singh", age: 28, gender: "Male" },
        { name: "Anjali Singh", age: 26, gender: "Female" },
        { name: "Rohan Singh", age: 4, gender: "Male" },
      ],
      bookingDetails: {
        operator: "Redbus Express",
        busNumber: "RB-8901",
        fromCity: "Bangalore",
        toCity: "Goa",
        departureTime: "10:00 PM",
        arrivalTime: "08:30 AM",
        duration: "10h 30m",
        busType: "AC Sleeper",
        seatNumbers: ["L1", "L2", "U3"],
        amenities: ["WiFi", "Blankets", "Water Bottle", "Charging Point"],
      },
      createdAt: now.toISOString(),
    },
    {
      userId: "test-user-1",
      bookingType: "activity",
      itemId: 1,
      status: "confirmed",
      totalAmount: 700000,
      paymentStatus: "paid",
      bookingDate: now.toISOString(),
      travelDate: threeDaysFromNow.toISOString(),
      passengers: [
        { name: "Karan Mehra", age: 32, gender: "Male" },
        { name: "Neha Mehra", age: 30, gender: "Female" },
      ],
      bookingDetails: {
        activityName: "Scuba Diving Adventure",
        location: "Havelock Island",
        city: "Andaman",
        duration: "4 hours",
        category: "Water Sports",
        startTime: "09:00 AM",
        includes: [
          "Equipment",
          "Instructor",
          "Underwater Photography",
          "Refreshments",
        ],
        meetingPoint: "Dive India Center, Beach No. 5",
        instructions:
          "Please arrive 30 minutes before start time. Bring swimwear and towel.",
      },
      createdAt: now.toISOString(),
    },
    {
      userId: "test-user-1",
      bookingType: "flight",
      itemId: 5,
      status: "cancelled",
      totalAmount: 380000,
      paymentStatus: "refunded",
      bookingDate: fiveDaysAgo.toISOString(),
      travelDate: twoDaysFromNow.toISOString(),
      passengers: [{ name: "Sanjay Gupta", age: 45, gender: "Male" }],
      bookingDetails: {
        airline: "IndiGo",
        flightNumber: "6E-7854",
        fromCity: "Chennai",
        toCity: "Kolkata",
        departureTime: "06:15 AM",
        arrivalTime: "08:50 AM",
        duration: "2h 35m",
        classType: "Economy",
        baggageAllowance: "15 kg",
        mealIncluded: false,
        seatNumbers: ["18C"],
        cancellationReason: "Change in travel plans",
        cancellationDate: new Date(
          fiveDaysAgo.getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
        refundAmount: 342000,
      },
      createdAt: fiveDaysAgo.toISOString(),
    },
    {
      userId: "test-user-1",
      bookingType: "hotel",
      itemId: 8,
      status: "completed",
      totalAmount: 1740000,
      paymentStatus: "paid",
      bookingDate: fifteenDaysAgo.toISOString(),
      travelDate: tenDaysAgo.toISOString(),
      passengers: [
        { name: "Deepak Rao", age: 38, gender: "Male" },
        { name: "Kavita Rao", age: 36, gender: "Female" },
      ],
      bookingDetails: {
        hotelName: "ITC Grand Bharat",
        location: "Manesar, Gurgaon",
        roomType: "Premium Room",
        nights: 3,
        checkIn: tenDaysAgo.toISOString(),
        checkOut: new Date(
          tenDaysAgo.getTime() + 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        roomNumber: "412",
        amenities: [
          "WiFi",
          "Breakfast",
          "Pool",
          "Spa",
          "Golf Course",
          "Mini Bar",
        ],
        pricePerNight: 580000,
        checkoutDate: new Date(
          tenDaysAgo.getTime() + 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        rating: 5,
        review: "Excellent stay with top-notch amenities",
      },
      createdAt: fifteenDaysAgo.toISOString(),
    },
  ];

  await db.insert(bookings).values(sampleBookings);

  console.log("✅ Bookings seeder completed successfully");
}

main().catch((error) => {
  console.error("❌ Seeder failed:", error);
});
