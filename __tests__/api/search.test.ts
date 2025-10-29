import { POST } from "@/app/api/search/route";
import { NextRequest } from "next/server";

describe("Search API", () => {
  it("should return flights when searching for flights", async () => {
    const request = new NextRequest("http://localhost:3000/api/search", {
      method: "POST",
      body: JSON.stringify({
        category: "flights",
        from: "Mumbai",
        to: "Delhi",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.count).toBeGreaterThanOrEqual(0);
  });

  it("should filter flights by class", async () => {
    const request = new NextRequest("http://localhost:3000/api/search", {
      method: "POST",
      body: JSON.stringify({
        category: "flights",
        from: "Mumbai",
        to: "Delhi",
        class: "business",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    data.data.forEach((flight: any) => {
      expect(flight.class).toBe("business");
    });
  });

  it("should return 400 for invalid category", async () => {
    const request = new NextRequest("http://localhost:3000/api/search", {
      method: "POST",
      body: JSON.stringify({
        category: "invalid",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should return hotels when searching for hotels", async () => {
    const request = new NextRequest("http://localhost:3000/api/search", {
      method: "POST",
      body: JSON.stringify({
        category: "hotels",
        to: "Mumbai",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
