"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock } from "lucide-react";

interface ActivityCardProps {
  activity: any;
  onBook: (id: string) => void;
}

export default function ActivityCard({ activity, onBook }: ActivityCardProps) {
  const includesList = Array.isArray(activity.includes)
    ? activity.includes
    : [];

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <Badge variant="secondary" className="mb-2">
              {activity.category}
            </Badge>
            <h3 className="font-semibold text-xl mb-1">{activity.title}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {activity.location}, {activity.city}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{activity.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {activity.duration}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {activity.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {includesList.slice(0, 3).map((item: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
            {includesList.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{includesList.length - 3} more
              </Badge>
            )}
          </div>

          <Badge variant="outline">
            {activity.availableSpots} spots available
          </Badge>

          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="text-2xl font-bold">
                ₹{activity.price.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">per person</p>
            </div>
            <Button onClick={() => onBook(activity.id.toString())}>
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
