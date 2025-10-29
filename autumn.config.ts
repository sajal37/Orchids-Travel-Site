import { feature, product, priceItem, featureItem } from "atmn";

export const bookings = feature({
  id: "bookings",
  name: "Bookings",
  type: "single_use",
});

export const basicSupport = feature({
  id: "basic_support",
  name: "Basic Support",
  type: "boolean",
});

export const standardSearch = feature({
  id: "standard_search",
  name: "Standard Search",
  type: "boolean",
});

export const prioritySupport = feature({
  id: "priority_support",
  name: "Priority Support",
  type: "boolean",
});

export const aiSearch = feature({
  id: "ai_search",
  name: "AI-Powered Smart Search",
  type: "boolean",
});

export const priceAlerts = feature({
  id: "price_alerts",
  name: "Price Alerts",
  type: "boolean",
});

export const advancedFilters = feature({
  id: "advanced_filters",
  name: "Advanced Filters",
  type: "boolean",
});

export const travelConcierge = feature({
  id: "travel_concierge",
  name: "Dedicated Travel Concierge",
  type: "boolean",
});

export const exclusiveDeals = feature({
  id: "exclusive_deals",
  name: "Exclusive Deals & Discounts",
  type: "boolean",
});

export const travelInsurance = feature({
  id: "travel_insurance",
  name: "Travel Insurance Included",
  type: "boolean",
});

export const premiumSupport247 = feature({
  id: "premium_support_24_7",
  name: "24/7 Premium Support",
  type: "boolean",
});

export const free = product({
  id: "free",
  name: "Free",
  is_default: true,
  items: [
    featureItem({
      feature_id: bookings.id,
      included_usage: 3,
      interval: "month",
    }),
    featureItem({
      feature_id: basicSupport.id,
    }),
    featureItem({
      feature_id: standardSearch.id,
    }),
  ],
});

export const pro = product({
  id: "pro",
  name: "Pro",
  items: [
    priceItem({
      price: 29,
      interval: "month",
    }),
    featureItem({
      feature_id: bookings.id,
    }),
    featureItem({
      feature_id: prioritySupport.id,
    }),
    featureItem({
      feature_id: aiSearch.id,
    }),
    featureItem({
      feature_id: priceAlerts.id,
    }),
    featureItem({
      feature_id: advancedFilters.id,
    }),
  ],
});

export const premium = product({
  id: "premium",
  name: "Premium",
  items: [
    priceItem({
      price: 99,
      interval: "month",
    }),
    featureItem({
      feature_id: bookings.id,
    }),
    featureItem({
      feature_id: prioritySupport.id,
    }),
    featureItem({
      feature_id: aiSearch.id,
    }),
    featureItem({
      feature_id: priceAlerts.id,
    }),
    featureItem({
      feature_id: advancedFilters.id,
    }),
    featureItem({
      feature_id: travelConcierge.id,
    }),
    featureItem({
      feature_id: exclusiveDeals.id,
    }),
    featureItem({
      feature_id: travelInsurance.id,
    }),
    featureItem({
      feature_id: premiumSupport247.id,
    }),
  ],
});
