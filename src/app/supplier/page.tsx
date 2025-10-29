"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Package,
  TrendingUp,
  Users,
  Plus,
  Settings,
} from "lucide-react";
import AIContentEditor from "@/components/AIContentEditor";

export default function SupplierDashboard() {
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const stats = [
    { label: "Total Listings", value: "24", change: "+3", icon: Package },
    {
      label: "Active Bookings",
      value: "156",
      change: "+12%",
      icon: TrendingUp,
    },
    { label: "Total Revenue", value: "₹8.4L", change: "+18%", icon: BarChart3 },
    { label: "Customer Rating", value: "4.8", change: "+0.2", icon: Users },
  ];

  const recentBookings = [
    {
      id: "BK001",
      customer: "John Doe",
      item: "Mumbai → Delhi Flight",
      amount: 4500,
      status: "confirmed",
    },
    {
      id: "BK002",
      customer: "Jane Smith",
      item: "Taj Mahal Palace",
      amount: 15000,
      status: "confirmed",
    },
    {
      id: "BK003",
      customer: "Bob Johnson",
      item: "VRL Sleeper Bus",
      amount: 1200,
      status: "pending",
    },
  ];

  const myListings = [
    {
      id: "FL001",
      type: "flight",
      name: "Mumbai → Delhi",
      price: 4500,
      status: "active",
      bookings: 45,
    },
    {
      id: "HT001",
      type: "hotel",
      name: "Taj Mahal Palace",
      price: 15000,
      status: "active",
      bookings: 120,
    },
    {
      id: "BS001",
      type: "bus",
      name: "VRL Sleeper",
      price: 1200,
      status: "active",
      bookings: 89,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b bg-white dark:bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Supplier Portal</h1>
              <p className="text-sm text-muted-foreground">
                Manage your listings and bookings
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Listing
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <Badge variant="secondary" className="mt-2">
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="ai-editor">AI Content Editor</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{listing.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {listing.bookings} bookings • ₹
                          {listing.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            listing.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {listing.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedItem(listing)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{booking.customer}</h4>
                        <p className="text-sm text-muted-foreground">
                          {booking.item}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{booking.amount.toLocaleString()}
                        </p>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-editor" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIContentEditor
                targetType="flight"
                targetId="FL001"
                onSuccess={() => alert("Changes applied!")}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Edit History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="font-medium">Decreased price by 2000</p>
                      <p className="text-muted-foreground">
                        Applied 2 hours ago
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="font-medium">Added 5 more seats</p>
                      <p className="text-muted-foreground">Applied yesterday</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="font-medium">Updated amenities</p>
                      <p className="text-muted-foreground">
                        Applied 3 days ago
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mb-2" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Chart visualization would appear here
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Monday</span>
                        <span className="text-sm font-medium">45 bookings</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Tuesday</span>
                        <span className="text-sm font-medium">38 bookings</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: "63%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Wednesday</span>
                        <span className="text-sm font-medium">52 bookings</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: "87%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
