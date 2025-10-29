import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public routes
  const publicRoutes = [
    "/",
    "/sign-in",
    "/sign-up",
    "/pricing",
    "/api/flights",
    "/api/hotels",
    "/api/buses",
    "/api/activities",
    "/api/auth",
    "/api/health",
    "/api/autumn",
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });

  // Allow public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes - check authentication
  const session = await auth.api.getSession({
    headers: await request.headers,
  });

  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
