import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// Travel marketplace tables
export const flights = sqliteTable("flights", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  airline: text("airline").notNull(),
  flightNumber: text("flight_number").notNull(),
  fromCity: text("from_city").notNull(),
  toCity: text("to_city").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  duration: text("duration").notNull(),
  price: integer("price").notNull(),
  availableSeats: integer("available_seats").notNull(),
  classType: text("class_type").notNull(),
  baggageAllowance: text("baggage_allowance"),
  mealIncluded: integer("meal_included", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull(),
});

export const hotels = sqliteTable("hotels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  rating: real("rating").notNull(),
  pricePerNight: integer("price_per_night").notNull(),
  amenities: text("amenities", { mode: "json" }),
  roomType: text("room_type").notNull(),
  availableRooms: integer("available_rooms").notNull(),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  images: text("images", { mode: "json" }),
  createdAt: text("created_at").notNull(),
});

export const buses = sqliteTable("buses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  operator: text("operator").notNull(),
  busNumber: text("bus_number").notNull(),
  fromCity: text("from_city").notNull(),
  toCity: text("to_city").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  duration: text("duration").notNull(),
  price: integer("price").notNull(),
  availableSeats: integer("available_seats").notNull(),
  busType: text("bus_type").notNull(),
  amenities: text("amenities", { mode: "json" }),
  createdAt: text("created_at").notNull(),
});

export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  duration: text("duration").notNull(),
  price: integer("price").notNull(),
  rating: real("rating").notNull(),
  maxParticipants: integer("max_participants").notNull(),
  availableSpots: integer("available_spots").notNull(),
  includes: text("includes", { mode: "json" }),
  images: text("images", { mode: "json" }),
  createdAt: text("created_at").notNull(),
});

export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  bookingType: text("booking_type").notNull(),
  itemId: integer("item_id").notNull(),
  bookingDetails: text("booking_details", { mode: "json" }),
  status: text("status").notNull().default("pending"),
  totalAmount: integer("total_amount").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  bookingDate: text("booking_date").notNull(),
  travelDate: text("travel_date").notNull(),
  passengers: text("passengers", { mode: "json" }),
  createdAt: text("created_at").notNull(),
});

export const favorites = sqliteTable("favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(),
  itemId: integer("item_id").notNull(),
  createdAt: text("created_at").notNull(),
});
