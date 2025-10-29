import { z } from "zod";

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Search validation
export const searchSchema = z.object({
  category: z.enum(["flights", "hotels", "buses", "activities"]),
  from: z.string().min(2).max(100).optional(),
  to: z.string().min(2).max(100).optional(),
  departDate: z.string().datetime().optional(),
  returnDate: z.string().datetime().optional(),
  passengers: z.number().int().min(1).max(20).optional(),
  class: z.enum(["economy", "business", "first"]).optional(),
  priceRange: z.tuple([z.number().min(0), z.number().min(0)]).optional(),
  amenities: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  sortBy: z.enum(["price", "rating", "duration", "departure"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Booking validation
export const createBookingSchema = z.object({
  bookingType: z.enum(["flight", "hotel", "bus", "activity"]),
  itemId: z.number().int().positive(),
  totalAmount: z.number().positive(),
  travelDate: z.string().datetime(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).default("pending"),
  paymentStatus: z.enum(["pending", "paid", "refunded", "failed"]).default("pending"),
  bookingDetails: z.record(z.string(), z.any()).optional(),
  passengers: z.array(z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().optional(),
    phone: z.string().min(10).max(20).optional(),
    age: z.number().int().min(0).max(150).optional(),
    passportNumber: z.string().optional(),
  })).min(1).optional(),
  paymentData: z.object({
    cardNumber: z.string().min(13).max(19),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
    expiryYear: z.string().regex(/^\d{2}$/),
    cvc: z.string().regex(/^\d{3,4}$/),
    cardholderName: z.string().min(1).max(100),
    amount: z.number().positive(),
  }).optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "refunded", "failed"]).optional(),
  bookingDetails: z.record(z.string(), z.any()).optional(),
  passengers: z.array(z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().optional(),
    phone: z.string().min(10).max(20).optional(),
    age: z.number().int().min(0).max(150).optional(),
    passportNumber: z.string().optional(),
  })).optional(),
  travelDate: z.string().datetime().optional(),
});

// User validation
export const signUpSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// AI validation
export const aiContentEditSchema = z.object({
  targetType: z.enum(["flight", "hotel", "bus", "activity"]),
  targetId: z.string(),
  naturalLanguageCommand: z.string().min(1).max(500),
  userId: z.string(),
});

export const nlQuerySchema = z.object({
  naturalLanguage: z.string().min(1).max(500),
  category: z.enum(["flights", "hotels", "buses", "activities"]),
});

export const recommendationsSchema = z.object({
  userId: z.string().optional(),
  category: z.enum(["flights", "hotels", "buses", "activities"]).optional(),
  limit: z.number().int().min(1).max(50).default(10),
});

// Payment validation
export const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  description: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const refundSchema = z.object({
  transactionId: z.string(),
  amount: z.number().positive().optional(),
  reason: z.string().max(500).optional(),
});

// Helper function to validate request body
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}
