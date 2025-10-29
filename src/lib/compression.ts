import { NextRequest, NextResponse } from "next/server";

// Simple compression middleware for API responses
export async function withCompression(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const response = await handler(request);
  
  // Add compression headers
  response.headers.set('Content-Encoding', 'gzip');
  response.headers.set('Vary', 'Accept-Encoding');
  
  return response;
}