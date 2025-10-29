import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { paymentService } from "@/lib/payments";
import { logger, metrics } from "@/lib/monitoring";

// Handle payment webhooks from payment processor
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (implementation would depend on payment provider)
    const signature = request.headers.get("stripe-signature"); // Example for Stripe
    
    // In a real implementation, you would verify the webhook signature here
    // For now, we'll skip verification for demonstration purposes
    
    const event = await request.json();
    
    logger.info("Payment webhook received", {
      eventType: event.type,
      eventId: event.id
    });
    
    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
        
      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;
        
      default:
        logger.info("Unhandled payment webhook event", {
          eventType: event.type
        });
    }
    
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error("Payment webhook error", error as Error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    const { id: paymentIntentId, amount, metadata } = paymentIntent;
    
    logger.info("Payment succeeded", {
      paymentIntentId,
      amount,
      bookingId: metadata?.bookingId
    });
    
    // Update booking status to confirmed if payment is successful
    if (metadata?.bookingId) {
      const updated = await db
        .update(bookings)
        .set({
          paymentStatus: "paid",
          status: "confirmed"
        })
        .where(eq(bookings.id, parseInt(metadata.bookingId)))
        .returning();
        
      if (updated.length > 0) {
        logger.info("Booking confirmed after payment", {
          bookingId: metadata.bookingId,
          paymentIntentId
        });
        
        metrics.increment("bookings.confirmed");
      }
    }
    
    metrics.increment("payments.succeeded");
  } catch (error) {
    logger.error("Error handling payment succeeded", error as Error);
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: any) {
  try {
    const { id: paymentIntentId, amount, metadata } = paymentIntent;
    
    logger.warn("Payment failed", {
      paymentIntentId,
      amount,
      bookingId: metadata?.bookingId
    });
    
    // Update booking status to payment failed
    if (metadata?.bookingId) {
      const updated = await db
        .update(bookings)
        .set({
          paymentStatus: "failed",
          status: "cancelled"
        })
        .where(eq(bookings.id, parseInt(metadata.bookingId)))
        .returning();
        
      if (updated.length > 0) {
        logger.info("Booking cancelled due to payment failure", {
          bookingId: metadata.bookingId,
          paymentIntentId
        });
        
        metrics.increment("bookings.cancelled.payment_failed");
      }
    }
    
    metrics.increment("payments.failed");
  } catch (error) {
    logger.error("Error handling payment failed", error as Error);
  }
}

// Handle refunded charge
async function handleChargeRefunded(charge: any) {
  try {
    const { id: chargeId, amount_refunded, metadata } = charge;
    
    logger.info("Charge refunded", {
      chargeId,
      amountRefunded: amount_refunded,
      bookingId: metadata?.bookingId
    });
    
    // Update booking status to refunded
    if (metadata?.bookingId) {
      const updated = await db
        .update(bookings)
        .set({
          paymentStatus: "refunded",
          status: "cancelled"
        })
        .where(eq(bookings.id, parseInt(metadata.bookingId)))
        .returning();
        
      if (updated.length > 0) {
        logger.info("Booking cancelled due to refund", {
          bookingId: metadata.bookingId,
          chargeId
        });
        
        metrics.increment("bookings.cancelled.refunded");
      }
    }
    
    metrics.increment("payments.refunded");
  } catch (error) {
    logger.error("Error handling charge refunded", error as Error);
  }
}