"use client";

import { useCustomer } from "autumn-js/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlanUsageIndicator() {
  const { customer, isLoading } = useCustomer();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!customer) return null;

  const planName = customer?.products?.[0]?.name || "Free";
  const isPaidPlan = planName !== "Free";
  const features = Object.values(customer?.features || {});

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your Plan</CardTitle>
          <Badge
            variant={isPaidPlan ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {isPaidPlan && <Crown className="h-3 w-3" />}
            {planName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {features.length > 0 ? (
          <div className="space-y-3">
            {features.map((feature: any) => {
              const hasLimit = typeof feature.included_usage === "number";
              const usage = feature.usage || 0;
              const limit = feature.included_usage;
              const percentage = hasLimit
                ? Math.min(100, (usage / limit) * 100)
                : 0;
              const isNearLimit = percentage > 75;
              const isAtLimit = percentage >= 100;

              return (
                <div key={feature.feature_id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {feature.feature_id === "bookings"
                          ? "Bookings"
                          : feature.feature_id.replace(/_/g, " ")}
                      </p>
                      {hasLimit && (
                        <p className="text-xs text-muted-foreground">
                          Resets:{" "}
                          {new Date(feature.next_reset_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-mono font-semibold">
                        {hasLimit ? `${usage}/${limit}` : `${usage} used`}
                      </span>
                      {isAtLimit && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>

                  {hasLimit && (
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          isAtLimit
                            ? "bg-destructive"
                            : isNearLimit
                            ? "bg-yellow-500"
                            : "bg-primary"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}

                  {isAtLimit && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>Limit reached. Upgrade to continue.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No usage data available
            </p>
          </div>
        )}

        {!isPaidPlan && (
          <Button asChild variant="default" className="w-full mt-4">
            <Link href="/pricing" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Upgrade Plan
            </Link>
          </Button>
        )}

        {isPaidPlan && (
          <Button asChild variant="outline" className="w-full mt-4">
            <Link href="/pricing">Manage Plan</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
