"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { PricingTable } from "@/components/autumn/pricing-table";
import { Sparkles, CheckCircle, Zap, Shield } from "lucide-react";

export default function PricingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session && window.location.search.includes("plan=")) {
      router.push(
        `/sign-in?redirect=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`
      );
    }
  }, [session, isPending, router]);

  const productDetails = [
    {
      id: "free",
      description: "Perfect for trying out our platform",
    },
    {
      id: "pro",
      description: "For frequent travelers who want more",
      recommendText: "Most Popular",
    },
    {
      id: "premium",
      description: "Ultimate travel experience with VIP treatment",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Unlock powerful features to enhance your travel booking experience
            </p>
          </div>
        </div>
      </div>

      {/* Features Banner */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 border-y">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium">AI-Powered Search</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium">Instant Booking</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">Secure Payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="container mx-auto px-4 py-16">
        <PricingTable productDetails={productDetails} />
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time from
                your account settings.
              </p>
            </div>
            <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">
                What happens to my bookings if I downgrade?
              </h3>
              <p className="text-muted-foreground">
                All your existing bookings remain valid. The booking limit only
                applies to new bookings each month.
              </p>
            </div>
            <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-muted-foreground">
                Start with our Free plan to try out the platform. Upgrade
                anytime to unlock premium features.
              </p>
            </div>
            <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">How secure are payments?</h3>
              <p className="text-muted-foreground">
                We use Stripe for secure payment processing. Your payment
                information is encrypted and never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
