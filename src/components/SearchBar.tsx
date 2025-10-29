"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plane,
  Hotel,
  Bus,
  Ticket,
  Calendar as CalendarIcon,
  Users,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { TravelCategory } from "@/types/travel";

interface SearchBarProps {
  onSearch: (params: any) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [category, setCategory] = useState<TravelCategory>("flights");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [passengers, setPassengers] = useState("1");
  const [travelClass, setTravelClass] = useState("economy");

  const handleSearch = () => {
    onSearch({
      category,
      from,
      to,
      departDate: departDate ? format(departDate, "yyyy-MM-dd") : null,
      returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : null,
      passengers: parseInt(passengers),
      class: travelClass,
    });
  };

  return (
    <div className="w-full bg-white dark:bg-card rounded-xl shadow-lg p-6">
      <Tabs
        value={category}
        onValueChange={(v) => setCategory(v as TravelCategory)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="flights" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="buses" className="flex items-center gap-2">
            <Bus className="h-4 w-4" />
            Buses
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Activities
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {(category === "flights" || category === "buses") && (
            <>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="From"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="To"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </>
          )}

          {category === "hotels" && (
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Destination"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {category === "activities" && (
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {departDate ? format(departDate, "PPP") : "Depart"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={departDate}
                onSelect={setDepartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {(category === "flights" || category === "hotels") && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate ? format(returnDate, "PPP") : "Return"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}

          <Select value={passengers} onValueChange={setPassengers}>
            <SelectTrigger>
              <Users className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Passengers" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "Passenger" : "Passengers"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {category === "flights" && (
            <Select value={travelClass} onValueChange={setTravelClass}>
              <SelectTrigger>
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="first">First Class</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <Button onClick={handleSearch} className="w-full mt-6" size="lg">
          Search {category.charAt(0).toUpperCase() + category.slice(1)}
        </Button>
      </Tabs>
    </div>
  );
}
