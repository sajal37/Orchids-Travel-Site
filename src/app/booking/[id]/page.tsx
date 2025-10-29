"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Crown,
  Loader2,
} from "lucide-react";
import { useCustomer } from "autumn-js/react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "flights";
  const { data: session } = useSession();
  const {
    customer,
    check,
    track,
    refetch,
    isLoading: customerLoading,
  } = useCustomer();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingItem, setFetchingItem] = useState(true);
  const [item, setItem] = useState<any>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [bookingAllowed, setBookingAllowed] = useState<boolean | null>(null);

  const [passengerDetails, setPassengerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  });

  // Fetch item details from API
  useEffect(() => {
    const fetchItem = async () => {
      setFetchingItem(true);
      try {
        const id = params.id as string;
        let url = "";

        switch (category) {
          case "flights":
            url = `/api/flights?id=${id}`;
            break;
          case "hotels":
            url = `/api/hotels?id=${id}`;
            break;
          case "buses":
            url = `/api/buses?id=${id}`;
            break;
          case "activities":
            url = `/api/activities?id=${id}`;
            break;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch item");
        }

        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error("Error fetching item:", error);
        toast.error("Failed to load booking details");
      } finally {
        setFetchingItem(false);
      }
    };

    fetchItem();
  }, [params.id, category]);

  // Check booking allowance when component mounts
  useEffect(() => {
    const checkBookingAllowance = async () => {
      if (!session || customerLoading) return;

      try {
        const { data } = await check({
          featureId: "bookings",
          requiredBalance: 1,
        });
        setBookingAllowed(data.allowed);

        if (!data.allowed) {
          setShowUpgradeDialog(true);
        }
      } catch (error) {
        console.error("Error checking booking allowance:", error);
        setBookingAllowed(true);
      }
    };

    checkBookingAllowance();
  }, [session, customerLoading, check]);

  const handleContinue = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      await handleConfirmBooking();
    }
  };

  const handleConfirmBooking = async () => {
    if (!session) {
      toast.error("Please sign in to complete your booking");
      router.push(
        `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    try {
      const { data } = await check({
        featureId: "bookings",
        requiredBalance: 1,
      });

      if (!data.allowed) {
        setShowUpgradeDialog(true);
        return;
      }
    } catch (error) {
      console.error("Error checking booking allowance:", error);
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");

      const bookingData = {
        bookingType: category,
        itemId: parseInt(params.id as string),
        bookingDetails: {
          passenger: passengerDetails,
          payment: { cardLast4: paymentDetails.cardNumber.slice(-4) },
        },
        status: "confirmed",
        totalAmount: getPrice() * 1.18,
        paymentStatus: "completed",
        bookingDate: new Date().toISOString(),
        travelDate: new Date().toISOString(),
        passengers: [passengerDetails],
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      const booking = await response.json();

      await track({
        featureId: "bookings",
        value: 1,
        idempotencyKey: `booking-${booking.id}-${Date.now()}`,
      });

      await refetch();

      toast.success("Booking confirmed!");
      router.push(`/confirmation/${booking.id}`);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to complete booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Item not found</p>
      </div>
    );
  }

  const getPrice = () => {
    return item.price || item.pricePerNight || 0;
  };

  const getItemName = () => {
    return (
      item.name || item.airline || item.operator || item.title || "Unknown"
    );
  };

  const getItemLocation = () => {
    if (item.fromCity && item.toCity) {
      return `${item.fromCity} → ${item.toCity}`;
    }
    if (item.location && item.city) {
      return `${item.location}, ${item.city}`;
    }
    return "";
  };

  const planName = customer?.products?.[0]?.name || "Free";
  const bookingFeature = customer?.features?.["bookings"];
  const bookingsUsed = bookingFeature?.usage || 0;
  const bookingsLimit = bookingFeature?.included_usage;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Upgrade Dialog */}
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Booking Limit Reached
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You've used all {bookingsLimit} bookings in your {planName} plan
                this month.
              </p>
              <p>
                Upgrade to Pro or Premium for unlimited bookings and premium
                features!
              </p>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">Current Usage:</p>
                <p>
                  {bookingsUsed} / {bookingsLimit} bookings used
                </p>
                {bookingFeature?.next_reset_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Resets:{" "}
                    {new Date(
                      bookingFeature.next_reset_at
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
            >
              Cancel
            </Button>
            <Button asChild>
              <Link href="/pricing" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                View Plans
              </Link>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Show warning if near limit */}
        {session &&
          bookingFeature &&
          bookingsLimit &&
          bookingsUsed >= bookingsLimit - 1 &&
          bookingAllowed && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    {bookingsUsed === bookingsLimit - 1
                      ? "Last booking remaining!"
                      : "Booking limit reached!"}
                  </p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                    You have {bookingsLimit - bookingsUsed} booking(s) left in
                    your {planName} plan.
                    <Link href="/pricing" className="underline ml-1">
                      Upgrade for unlimited bookings
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {[
                    { num: 1, label: "Passenger Details" },
                    { num: 2, label: "Payment" },
                    { num: 3, label: "Review" },
                  ].map((s, idx) => (
                    <div key={s.num} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            step >= s.num
                              ? "bg-primary text-primary-foreground"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {step > s.num ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            s.num
                          )}
                        </div>
                        <span className="text-sm mt-2 hidden md:block">
                          {s.label}
                        </span>
                      </div>
                      {idx < 2 && (
                        <div
                          className={`h-1 flex-1 ${
                            step > s.num ? "bg-primary" : "bg-gray-200"
                          }`}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Passenger Details */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Passenger Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={passengerDetails.firstName}
                        onChange={(e) =>
                          setPassengerDetails({
                            ...passengerDetails,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={passengerDetails.lastName}
                        onChange={(e) =>
                          setPassengerDetails({
                            ...passengerDetails,
                            lastName: e.target.value,
                          })
                        }
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={passengerDetails.email}
                        onChange={(e) =>
                          setPassengerDetails({
                            ...passengerDetails,
                            email: e.target.value,
                          })
                        }
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={passengerDetails.phone}
                        onChange={(e) =>
                          setPassengerDetails({
                            ...passengerDetails,
                            phone: e.target.value,
                          })
                        }
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={passengerDetails.dateOfBirth}
                        onChange={(e) =>
                          setPassengerDetails({
                            ...passengerDetails,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        value={paymentDetails.cardNumber}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            cardNumber: e.target.value,
                          })
                        }
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nameOnCard">Name on Card *</Label>
                      <Input
                        id="nameOnCard"
                        value={paymentDetails.nameOnCard}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            nameOnCard: e.target.value,
                          })
                        }
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          value={paymentDetails.expiryDate}
                          onChange={(e) =>
                            setPaymentDetails({
                              ...paymentDetails,
                              expiryDate: e.target.value,
                            })
                          }
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          value={paymentDetails.cvv}
                          onChange={(e) =>
                            setPaymentDetails({
                              ...paymentDetails,
                              cvv: e.target.value,
                            })
                          }
                          placeholder="123"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Your payment information is secure and encrypted
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Passenger Information
                    </h4>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p>
                        {passengerDetails.firstName} {passengerDetails.lastName}
                      </p>
                      <p>{passengerDetails.email}</p>
                      <p>{passengerDetails.phone}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Payment Method</h4>
                    <p className="text-sm text-muted-foreground">
                      Card ending in {paymentDetails.cardNumber.slice(-4)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Previous
                </Button>
              )}
              <Button
                onClick={handleContinue}
                disabled={
                  loading || (!customerLoading && bookingAllowed === false)
                }
                className={step === 1 ? "ml-auto" : ""}
              >
                {loading
                  ? "Processing..."
                  : step === 3
                    ? "Confirm Booking"
                    : "Continue"}
              </Button>
            </div>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{getItemName()}</h4>
                  {getItemLocation() && (
                    <p className="text-sm text-muted-foreground">
                      {getItemLocation()}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Price</span>
                    <span>₹{getPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees</span>
                    <span>
                      ₹{Math.round(getPrice() * 0.18).toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>
                      ₹{Math.round(getPrice() * 1.18).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className="w-full justify-center py-2"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Secure Booking
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
