"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Plane,
  Hotel,
  Bus,
  Activity,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import Link from "next/link";

interface Booking {
  id: number;
  userId: string;
  bookingType: string;
  itemId: number;
  status: string;
  totalAmount: number;
  bookingDate: string;
  travelDate: string;
  passengers: any;
  itemDetails?: any;
}

const categoryIcons = {
  flight: Plane,
  hotel: Hotel,
  bus: Bus,
  activity: Activity,
};

const statusColors = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  cancelled: "bg-red-500",
  completed: "bg-blue-500",
};

export default function BookingsPage() {
  const { data: session, isPending: authLoading } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "cancelled" | "completed"
  >("all");

  useEffect(() => {
    if (!authLoading && !session?.user) {
      router.push(`/sign-in?redirect=${encodeURIComponent("/bookings")}`);
    }
  }, [session, authLoading, router]);

  useEffect(() => {
    if (!session?.user) return;

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("bearer_token");
        const url =
          filter === "all" ? "/api/bookings" : `/api/bookings?status=${filter}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [session, filter]);

  const getStatusBadge = (status: string) => {
    return (
      <Badge
        variant="outline"
        className={`${statusColors[status as keyof typeof statusColors]} text-white border-none`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const getItemName = (booking: Booking) => {
    if (!booking.itemDetails) return "Unknown";

    switch (booking.bookingType) {
      case "flight":
        return `${booking.itemDetails.airline} ${booking.itemDetails.flightNumber}`;
      case "hotel":
        return booking.itemDetails.name;
      case "bus":
        return `${booking.itemDetails.operator} - ${booking.itemDetails.busNumber}`;
      case "activity":
        return booking.itemDetails.title;
      default:
        return "Unknown";
    }
  };

  const getItemLocation = (booking: Booking) => {
    if (!booking.itemDetails) return "";

    switch (booking.bookingType) {
      case "flight":
      case "bus":
        return `${booking.itemDetails.fromCity} → ${booking.itemDetails.toCity}`;
      case "hotel":
        return `${booking.itemDetails.location}, ${booking.itemDetails.city}`;
      case "activity":
        return `${booking.itemDetails.location}, ${booking.itemDetails.city}`;
      default:
        return "";
    }
  };

  if (authLoading || !session?.user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            View and manage all your travel bookings
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive mb-4">Error: {error}</p>
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plane className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6 text-center">
                Start exploring and book your next adventure!
              </p>
              <Button asChild>
                <Link href="/">Browse Trips</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as any)}
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>

            {bookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    No {filter} bookings found
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const Icon =
                    categoryIcons[
                      booking.bookingType as keyof typeof categoryIcons
                    ] || Plane;
                  return (
                    <Card
                      key={booking.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {getItemName(booking)}
                              </CardTitle>
                              <CardDescription>
                                {getItemLocation(booking)}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Booked on</p>
                              <p className="font-medium">
                                {formatDate(booking.bookingDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">
                                Travel date
                              </p>
                              <p className="font-medium">
                                {formatDate(booking.travelDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">
                                Passengers
                              </p>
                              <p className="font-medium">
                                {Array.isArray(booking.passengers)
                                  ? booking.passengers.length
                                  : 1}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">
                                Total price
                              </p>
                              <p className="font-medium">
                                ₹{booking.totalAmount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/confirmation/${booking.id}`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
