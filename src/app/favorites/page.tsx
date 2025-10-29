"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Plane,
  Hotel,
  Bus,
  MapPin,
  Loader2,
  Star,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function FavoritesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in?redirect=/favorites");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchFavorites();
    }
  }, [session]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch favorites");

      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (id: number) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/favorites?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to remove favorite");

      toast.success("Removed from favorites");
      setFavorites(favorites.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove favorite");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (favorite: any) => {
    if (!favorite.itemDetails) {
      toast.error("Item details not available");
      return;
    }
    router.push(`/booking/${favorite.itemId}?category=${favorite.itemType}`);
  };

  const filteredFavorites =
    activeTab === "all"
      ? favorites
      : favorites.filter((f) => f.itemType === activeTab);

  const renderFavoriteCard = (favorite: any) => {
    const item = favorite.itemDetails;

    if (!item) {
      return (
        <Card key={favorite.id} className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-muted-foreground">Item details unavailable</p>
          </CardContent>
        </Card>
      );
    }

    const getIcon = () => {
      switch (favorite.itemType) {
        case "flight":
          return <Plane className="h-5 w-5" />;
        case "hotel":
          return <Hotel className="h-5 w-5" />;
        case "bus":
          return <Bus className="h-5 w-5" />;
        case "activity":
          return <MapPin className="h-5 w-5" />;
        default:
          return <Heart className="h-5 w-5" />;
      }
    };

    const getTitle = () => {
      switch (favorite.itemType) {
        case "flight":
          return `${item.airline} ${item.flightNumber}`;
        case "hotel":
          return item.name;
        case "bus":
          return `${item.operator} - ${item.busNumber}`;
        case "activity":
          return item.title;
        default:
          return "Unknown";
      }
    };

    const getLocation = () => {
      switch (favorite.itemType) {
        case "flight":
          return `${item.fromCity} → ${item.toCity}`;
        case "hotel":
          return `${item.location}, ${item.city}`;
        case "bus":
          return `${item.fromCity} → ${item.toCity}`;
        case "activity":
          return `${item.location}, ${item.city}`;
        default:
          return "";
      }
    };

    const getPrice = () => {
      return item.price || item.pricePerNight || 0;
    };

    return (
      <Card
        key={favorite.id}
        className="overflow-hidden hover:shadow-lg transition-shadow"
      >
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Image placeholder */}
            <div className="w-full sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              {getIcon()}
              <span className="ml-2 text-white font-semibold">
                {favorite.itemType.toUpperCase()}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{getTitle()}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {getLocation()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  disabled={deletingId === favorite.id}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  {deletingId === favorite.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className="h-5 w-5 fill-current" />
                  )}
                </Button>
              </div>

              {/* Additional details */}
              <div className="space-y-2 mb-4">
                {favorite.itemType === "hotel" && item.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{item.rating}</span>
                    <span className="text-muted-foreground">/ 5</span>
                  </div>
                )}
                {(favorite.itemType === "flight" ||
                  favorite.itemType === "bus") && (
                  <p className="text-sm text-muted-foreground">
                    Duration: {item.duration}
                  </p>
                )}
                {favorite.itemType === "activity" && item.category && (
                  <Badge variant="secondary">{item.category}</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    ₹{getPrice().toLocaleString()}
                  </p>
                  {favorite.itemType === "hotel" && (
                    <p className="text-xs text-muted-foreground">per night</p>
                  )}
                </div>
                <Button onClick={() => handleViewDetails(favorite)}>
                  Book Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            My Favorites
          </h1>
          <p className="text-muted-foreground">
            Your saved travel destinations and experiences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All ({favorites.length})</TabsTrigger>
            <TabsTrigger value="flight">
              <Plane className="h-4 w-4 mr-2" />
              Flights ({favorites.filter((f) => f.itemType === "flight").length}
              )
            </TabsTrigger>
            <TabsTrigger value="hotel">
              <Hotel className="h-4 w-4 mr-2" />
              Hotels ({favorites.filter((f) => f.itemType === "hotel").length})
            </TabsTrigger>
            <TabsTrigger value="bus">
              <Bus className="h-4 w-4 mr-2" />
              Buses ({favorites.filter((f) => f.itemType === "bus").length})
            </TabsTrigger>
            <TabsTrigger value="activity">
              <MapPin className="h-4 w-4 mr-2" />
              Activities (
              {favorites.filter((f) => f.itemType === "activity").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredFavorites.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-6">
                Start adding your favorite travel options to see them here
              </p>
              <Button asChild>
                <Link href="/">Browse Travel Options</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFavorites.map(renderFavoriteCard)}
          </div>
        )}
      </div>
    </div>
  );
}
