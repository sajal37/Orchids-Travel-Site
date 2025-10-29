"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bus as BusIcon, Clock, MapPin, Wifi, Zap } from "lucide-react";

interface BusCardProps {
  bus: any;
  onBook: (id: string) => void;
}

export default function BusCard({ bus, onBook }: BusCardProps) {
  const getBusTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ac: "AC",
      "non-ac": "Non-AC",
      sleeper: "Sleeper",
      "semi-sleeper": "Semi-Sleeper",
    };
    return labels[type] || type;
  };

  const amenitiesList = Array.isArray(bus.amenities) ? bus.amenities : [];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BusIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{bus.operator}</h3>
                  <Badge variant="secondary">
                    {getBusTypeLabel(bus.busType)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold">{bus.departureTime}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {bus.fromCity}
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
                  {bus.duration}
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold">{bus.arrivalTime}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {bus.toCity}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {amenitiesList.slice(0, 3).map((amenity: string, idx: number) => (
                <span key={idx} className="flex items-center gap-1">
                  {amenity.toLowerCase().includes("wifi") ? (
                    <Wifi className="h-4 w-4" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  {amenity}
                </span>
              ))}
              <Badge variant="outline">{bus.availableSeats} seats left</Badge>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            <div className="text-right">
              <p className="text-3xl font-bold">
                ₹{bus.price.toLocaleString()}
              </p>
            </div>
            <Button
              onClick={() => onBook(bus.id.toString())}
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
