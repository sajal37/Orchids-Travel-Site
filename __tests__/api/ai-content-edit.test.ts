import { POST } from "@/app/api/ai/content-edit/route";
import { NextRequest } from "next/server";

describe("AI Content Edit API", () => {
  it("should generate preview for price decrease command", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/ai/content-edit",
      {
        method: "POST",
        body: JSON.stringify({
          targetType: "flight",
          targetId: "FL001",
          naturalLanguageCommand: "Decrease price by 2000",
          userId: "test-user",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe("preview");
    expect(data.data.proposedContent.price).toBeLessThan(
      data.data.originalContent.price
    );
  });

  it("should generate preview for seat addition command", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/ai/content-edit",
      {
        method: "POST",
        body: JSON.stringify({
          targetType: "flight",
          targetId: "FL001",
          naturalLanguageCommand: "Add 5 more seats",
          userId: "test-user",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.proposedContent.seats).toBeGreaterThan(
      data.data.originalContent.seats
    );
  });

  it("should return 400 for missing required fields", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/ai/content-edit",
      {
        method: "POST",
        body: JSON.stringify({
          targetType: "flight",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing required fields");
  });

  it("should return 404 for non-existent item", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/ai/content-edit",
      {
        method: "POST",
        body: JSON.stringify({
          targetType: "flight",
          targetId: "NONEXISTENT",
          naturalLanguageCommand: "Decrease price by 1000",
          userId: "test-user",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Item not found");
  });
});
