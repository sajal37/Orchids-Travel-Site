"use client";

import { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import FlightCard from "@/components/FlightCard";
import HotelCard from "@/components/HotelCard";
import BusCard from "@/components/BusCard";
import ActivityCard from "@/components/ActivityCard";
import FilterSidebar from "@/components/FilterSidebar";
import { TravelCategory } from "@/types/travel";
import {
  Sparkles,
  Loader2,
  Star,
  Globe,
  Shield,
  Zap,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Award,
  Users,
  Heart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const [searchParams, setSearchParams] = useState<any>(null);
  const [category, setCategory] = useState<TravelCategory>("flights");
  const [filters, setFilters] = useState<any>({});
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (params: any) => {
    setSearchParams(params);
    setCategory(params.category);
  };

  // Fetch data when search params change
  useEffect(() => {
    if (!searchParams) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = "";
        const params = new URLSearchParams();

        switch (category) {
          case "flights":
            url = "/api/flights";
            if (searchParams.from) params.append("search", searchParams.from);
            if (filters.classType)
              params.append("classType", filters.classType);
            if (filters.minPrice) params.append("minPrice", filters.minPrice);
            if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
            break;
          case "hotels":
            url = "/api/hotels";
            if (searchParams.to) params.append("search", searchParams.to);
            if (filters.rating) params.append("minRating", filters.rating);
            if (filters.minPrice) params.append("minPrice", filters.minPrice);
            if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
            break;
          case "buses":
            url = "/api/buses";
            if (searchParams.from) params.append("search", searchParams.from);
            if (filters.busType) params.append("busType", filters.busType);
            if (filters.minPrice) params.append("minPrice", filters.minPrice);
            if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
            break;
          case "activities":
            url = "/api/activities";
            if (searchParams.to) params.append("search", searchParams.to);
            if (filters.category) params.append("category", filters.category);
            if (filters.minPrice) params.append("minPrice", filters.minPrice);
            if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
            break;
        }

        const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
        const response = await fetch(fullUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setListings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, category, filters]);

  const handleBook = (id: string) => {
    window.location.href = `/booking/${id}?category=${category}`;
  };

  const renderListings = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-destructive mb-2">Error loading {category}</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (listings.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg font-medium mb-2">No {category} found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search criteria
          </p>
        </div>
      );
    }

    switch (category) {
      case "flights":
        return listings.map((flight) => (
          <FlightCard key={flight.id} flight={flight} onBook={handleBook} />
        ));
      case "hotels":
        return listings.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} onBook={handleBook} />
        ));
      case "buses":
        return listings.map((bus) => (
          <BusCard key={bus.id} bus={bus} onBook={handleBook} />
        ));
      case "activities":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onBook={handleBook}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const popularDestinations = [
    { name: "Goa", image: "🏖️", description: "Beaches & Nightlife" },
    { name: "Mumbai", image: "🌆", description: "City of Dreams" },
    { name: "Jaipur", image: "🏰", description: "Pink City" },
    { name: "Kerala", image: "🌴", description: "God's Own Country" },
    { name: "Manali", image: "⛰️", description: "Mountain Paradise" },
    { name: "Udaipur", image: "🏛️", description: "City of Lakes" },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Search",
      description:
        "Smart recommendations based on your preferences and history",
    },
    {
      icon: Shield,
      title: "Secure Booking",
      description: "PCI-DSS compliant payments with end-to-end encryption",
    },
    {
      icon: Zap,
      title: "Instant Confirmation",
      description: "Get booking confirmations instantly via email and SMS",
    },
    {
      icon: Globe,
      title: "Wide Coverage",
      description:
        "100+ airlines, 500K+ properties, and thousands of activities",
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Business Traveler",
      rating: 5,
      comment:
        "Best travel booking platform! The AI recommendations saved me hours of searching.",
    },
    {
      name: "Rahul Verma",
      role: "Family Vacation",
      rating: 5,
      comment:
        "Booked a complete family trip in minutes. Loved the user-friendly interface!",
    },
    {
      name: "Anita Patel",
      role: "Solo Traveler",
      rating: 5,
      comment:
        "Affordable prices and excellent customer support. Highly recommended!",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Hero Section - Premium Design */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 text-sm font-medium">
              <Award className="h-3.5 w-3.5 mr-2" />
              Trusted by 100,000+ travelers worldwide
            </Badge>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 dark:from-white dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent leading-tight">
              Travel Smarter,
              <br />
              Live Better
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Experience the future of travel with AI-powered search, instant bookings,
              and personalized recommendations at your fingertips
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">Instant Confirmation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">24/7 Support</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
              <SearchBar onSearch={handleSearch} />
            </div>
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <div className="relative border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  100K+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Travelers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  500K+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Properties Listed</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  50K+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Flight Routes</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  24/7
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Customer Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Section - Modern Design */}
      {searchParams && (
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24">
                <FilterSidebar category={category} onFilterChange={setFilters} />
              </div>
            </aside>

            {/* Results */}
            <main className="flex-1">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {searchParams.from && searchParams.to
                        ? `${searchParams.from} → ${searchParams.to}`
                        : `${category.charAt(0).toUpperCase() + category.slice(1)}`}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching for best deals...
                        </span>
                      ) : (
                        <span className="font-medium">
                          {listings.length} {category} available
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {!loading && listings.length > 0 && (
                    <Badge variant="secondary" className="text-sm">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Sorted
                    </Badge>
                  )}
                </div>
                
                {!loading && listings.length > 0 && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Free cancellation
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-blue-500" />
                      Secure payment
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Instant confirmation
                    </div>
                  </div>
                )}
              </div>

              {/* Results Grid */}
              <div className="space-y-6">
                {renderListings()}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* Landing Content - Premium Design */}
      {!searchParams && (
        <>
          {/* AI Features Showcase */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-4">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm md:text-base font-medium">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>AI-Powered Search</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span>Instant Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  <span>Best Price Guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="container mx-auto px-4 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0">
                Our Services
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Everything You Need
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                From flights to activities, we've got your entire journey covered
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Flights",
                  desc: "Compare 100+ airlines for best prices",
                  icon: "✈️",
                  count: "50K+ routes",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  title: "Hotels",
                  desc: "500K+ verified properties worldwide",
                  icon: "🏨",
                  count: "Best rates",
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  title: "Buses",
                  desc: "Comfortable rides on 10K+ routes",
                  icon: "🚌",
                  count: "Safe travel",
                  gradient: "from-orange-500 to-red-500",
                },
                {
                  title: "Activities",
                  desc: "5K+ curated experiences",
                  icon: "🎫",
                  count: "Unique tours",
                  gradient: "from-green-500 to-emerald-500",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <CardContent className="p-8 relative">
                      <div className="text-6xl mb-6">{item.icon}</div>
                      <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{item.desc}</p>
                      <Badge className={`bg-gradient-to-r ${item.gradient} text-white border-0`}>
                        {item.count}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900/50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-0">
                Top Destinations
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Popular Destinations
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Discover the most loved travel destinations
              </p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {popularDestinations.map((dest, index) => (
                <motion.div
                  key={dest.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 border-0 bg-white dark:bg-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{dest.image}</div>
                      <h4 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{dest.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {dest.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="container mx-auto px-4 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Why Choose Us
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Industry-leading features for the best travel experience
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI CTA Section */}
          <div className="container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-white text-center shadow-2xl"
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-10 w-10" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  AI-Powered Travel Planning
                </h2>
                <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Experience the future of travel with natural language search,
                  smart recommendations, and instant bookings powered by AI
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {[
                    "🤖 Natural Language Search",
                    "🔍 Smart Filters",
                    "⚡ Instant Booking",
                    "📊 Price Tracking",
                  ].map((feature) => (
                    <div key={feature} className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 font-medium">
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                    <Link href="/pricing">
                      Explore Premium Features
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 hover:bg-white/20 text-white border-white/30" asChild>
                    <Link href="/help">Learn More</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Testimonials */}
          <div className="container mx-auto px-4 py-20 bg-gray-50 dark:bg-transparent">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                <Users className="h-3 w-3 mr-1" />
                Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Loved by Travelers
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                See what our customers have to say
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                        "{testimonial.comment}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
