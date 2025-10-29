"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FilterSidebarProps {
  category: string;
  onFilterChange: (filters: any) => void;
}

export default function FilterSidebar({
  category,
  onFilterChange,
}: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [classType, setClassType] = useState("");
  const [rating, setRating] = useState("");
  const [busType, setBusType] = useState("");
  const [activityCategory, setActivityCategory] = useState("");

  const ratings = [5, 4, 3, 2];
  const classTypes = ["economy", "business", "first"];
  const busTypes = ["ac", "non-ac", "sleeper", "semi-sleeper"];
  const activityCategories = [
    "Adventure",
    "Culture",
    "Food & Dining",
    "Entertainment",
    "Nature",
    "Shopping",
  ];

  const handleApplyFilters = () => {
    const filters: any = {
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    };

    if (category === "flights" && classType) {
      filters.classType = classType;
    }

    if ((category === "hotels" || category === "activities") && rating) {
      filters.rating = rating;
    }

    if (category === "buses" && busType) {
      filters.busType = busType;
    }

    if (category === "activities" && activityCategory) {
      filters.category = activityCategory;
    }

    onFilterChange(filters);
  };

  const handleReset = () => {
    setPriceRange([0, 100000]);
    setClassType("");
    setRating("");
    setBusType("");
    setActivityCategory("");
    onFilterChange({});
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Price Range
          </Label>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={100000}
            step={1000}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        <Separator />

        {category === "flights" && (
          <div>
            <Label className="text-base font-semibold mb-3 block">Class</Label>
            <RadioGroup value={classType} onValueChange={setClassType}>
              <div className="space-y-2">
                {classTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} />
                    <label
                      htmlFor={type}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        {category === "buses" && (
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Bus Type
            </Label>
            <RadioGroup value={busType} onValueChange={setBusType}>
              <div className="space-y-2">
                {busTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} />
                    <label
                      htmlFor={type}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                    >
                      {type === "ac"
                        ? "AC"
                        : type === "non-ac"
                        ? "Non-AC"
                        : type.replace("-", " ")}
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        {(category === "hotels" || category === "activities") && (
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Minimum Rating
            </Label>
            <RadioGroup value={rating} onValueChange={setRating}>
              <div className="space-y-2">
                {ratings.map((r) => (
                  <div key={r} className="flex items-center space-x-2">
                    <RadioGroupItem value={r.toString()} id={`rating-${r}`} />
                    <label
                      htmlFor={`rating-${r}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {r}+ Stars
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        {category === "activities" && (
          <>
            <Separator />
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Category
              </Label>
              <RadioGroup
                value={activityCategory}
                onValueChange={setActivityCategory}
              >
                <div className="space-y-2">
                  {activityCategories.map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <RadioGroupItem value={cat} id={`cat-${cat}`} />
                      <label
                        htmlFor={`cat-${cat}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
