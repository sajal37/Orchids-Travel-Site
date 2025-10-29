"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Download,
  Mail,
  Calendar,
  MapPin,
  User,
  Loader2,
} from "lucide-react";

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch(`/api/bookings?id=${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch booking");
        }

        const data = await response.json();
        setBooking(data);
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const bookingId = booking?.id
    ? `BK${booking.id.toString().padStart(8, "0")}`
    : `BK${Date.now().toString().slice(-8)}`;
  const bookingDate = booking?.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString()
    : new Date().toLocaleDateString();
  const status = booking?.status || "confirmed";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8 md:p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your booking has been successfully processed
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Booking ID</span>
              <span className="font-mono font-semibold">{bookingId}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium capitalize">
                {status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Booking Date</span>
              <span className="font-semibold">{bookingDate}</span>
            </div>
            {booking?.totalAmount && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">
                  ₹{booking.totalAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />A confirmation email has been sent to
              your email address
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button className="flex-1" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>

          <div className="pt-6 border-t space-y-4">
            <h3 className="font-semibold text-lg">What's Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Mail className="h-6 w-6 text-primary" />
                <p className="font-medium">Check Email</p>
                <p className="text-muted-foreground text-xs text-center">
                  View booking details and tickets
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Calendar className="h-6 w-6 text-primary" />
                <p className="font-medium">Prepare for Trip</p>
                <p className="text-muted-foreground text-xs text-center">
                  Add to calendar and plan ahead
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <User className="h-6 w-6 text-primary" />
                <p className="font-medium">Manage Booking</p>
                <p className="text-muted-foreground text-xs text-center">
                  View or modify in My Trips
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
