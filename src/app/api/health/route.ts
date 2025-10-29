import { NextResponse } from "next/server";
import { getHealthStatus } from "@/lib/monitoring";
import { DatabaseService } from "@/lib/database-service";

export async function GET() {
  try {
    // Check database connectivity
    const dbHealthy = await DatabaseService.healthCheck();
    
    const health = getHealthStatus();

    const overallHealth = dbHealthy && health.status === "healthy";

    return NextResponse.json(
      {
        ...health,
        status: overallHealth ? "healthy" : "unhealthy",
        services: {
          database: dbHealthy ? "healthy" : "unhealthy",
          application: health.status,
        },
      },
      {
        status: overallHealth ? 200 : 503,
        headers: {
          "Cache-Control": "no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
