// Core type definitions for the travel marketplace

export type TravelCategory = "flights" | "hotels" | "buses" | "activities";

export interface Location {
  id: string;
  city: string;
  country: string;
  code?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  from: Location;
  to: Location;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  currency: string;
  class: "economy" | "business" | "first";
  stops: number;
  seats: number;
  baggage: string;
  amenities: string[];
}

export interface Hotel {
  id: string;
  name: string;
  location: Location;
  rating: number;
  reviews: number;
  pricePerNight: number;
  currency: string;
  image: string;
  amenities: string[];
  roomType: string;
  availability: boolean;
  cancellationPolicy: string;
  description: string;
}

export interface Bus {
  id: string;
  operator: string;
  from: Location;
  to: Location;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  currency: string;
  busType: "ac" | "non-ac" | "sleeper" | "semi-sleeper";
  seats: number;
  amenities: string[];
}

export interface Activity {
  id: string;
  name: string;
  location: Location;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  duration: string;
  image: string;
  description: string;
  included: string[];
  availability: boolean;
}

export interface SearchParams {
  category: TravelCategory;
  from?: string;
  to?: string;
  date?: string;
  returnDate?: string;
  passengers?: number;
  class?: string;
}

export interface Booking {
  id: string;
  userId: string;
  itemId: string;
  category: TravelCategory;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  amount: number;
  currency: string;
  bookingDate: string;
  travelDate: string;
  passengers: PassengerInfo[];
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
}

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  documentType?: string;
  documentNumber?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "supplier" | "admin";
  avatar?: string;
  createdAt: string;
}

export interface AIContentEdit {
  id: string;
  targetType: "flight" | "hotel" | "bus" | "activity" | "page";
  targetId: string;
  originalContent: any;
  proposedContent: any;
  description: string;
  status: "preview" | "applied" | "rejected" | "rolled-back";
  createdBy: string;
  createdAt: string;
  appliedAt?: string;
  appliedBy?: string;
}

export interface AIQuery {
  id: string;
  naturalLanguage: string;
  parsedQuery: {
    filters: Record<string, any>;
    sort?: { field: string; order: "asc" | "desc" };
    limit?: number;
  };
  category: TravelCategory;
  createdAt: string;
  executedAt?: string;
  resultCount?: number;
}

export interface Recommendation {
  id: string;
  userId: string;
  itemId: string;
  category: TravelCategory;
  score: number;
  reason: string;
  createdAt: string;
}
