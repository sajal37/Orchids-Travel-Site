"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, MapPin, Wifi, Utensils } from "lucide-react";

interface FlightCardProps {
  flight: any;
  onBook: (id: string) => void;
}

export default function FlightCard({ flight, onBook }: FlightCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{flight.airline}</h3>
                  <p className="text-sm text-muted-foreground">
                    {flight.flightNumber}
                  </p>
                </div>
              </div>
              <Badge variant="default">Non-stop</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold">{flight.departureTime}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {flight.fromCity}
                </p>
              </div>

              <div className="flex-1 px-4">
                <div className="relative">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border"></div>
                  <div className="relative flex justify-center">
                    <Clock className="h-5 w-5 bg-background text-muted-foreground" />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {flight.duration}
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold">{flight.arrivalTime}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {flight.toCity}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {flight.mealIncluded && (
                <div className="flex items-center gap-1">
                  <Utensils className="h-4 w-4" />
                  Meals
                </div>
              )}
              {flight.baggageAllowance && (
                <span>{flight.baggageAllowance}</span>
              )}
              <Badge variant="outline">
                {flight.availableSeats} seats left
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            <div className="text-right">
              <p className="text-3xl font-bold">
                ₹{flight.price.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {flight.classType}
              </p>
            </div>
            <Button
              onClick={() => onBook(flight.id.toString())}
              className="w-full md:w-auto"
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
