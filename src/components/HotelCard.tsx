"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";

interface HotelCardProps {
  hotel: any;
  onBook: (id: string) => void;
}

export default function HotelCard({ hotel, onBook }: HotelCardProps) {
  const amenitiesList = Array.isArray(hotel.amenities) ? hotel.amenities : [];

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-xl mb-1">{hotel.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {hotel.location}, {hotel.city}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{hotel.rating}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {amenitiesList.slice(0, 4).map((amenity: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {amenitiesList.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{amenitiesList.length - 4} more
                </Badge>
              )}
            </div>

            <Badge variant="outline">
              {hotel.availableRooms} rooms available
            </Badge>
          </div>

          <div className="flex flex-col items-end justify-between gap-2 md:w-48">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">per night</p>
              <p className="text-3xl font-bold">
                ₹{hotel.pricePerNight.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">{hotel.roomType}</p>
            </div>
            <Button
              onClick={() => onBook(hotel.id.toString())}
              className="w-full"
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
