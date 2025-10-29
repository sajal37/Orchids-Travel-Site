"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  User,
  Bell,
  Heart,
  Plane,
  LogOut,
  Settings,
  BookMarked,
  Crown,
  Sparkles,
  HelpCircle,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { useCustomer } from "autumn-js/react";
import { toast } from "sonner";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, isPending, refetch } = useSession();
  const { customer, isLoading: customerLoading } = useCustomer();
  const router = useRouter();

  const navItems = [
    { label: "Flights", href: "#flights" },
    { label: "Hotels", href: "#hotels" },
    { label: "Buses", href: "#buses" },
    { label: "Activities", href: "#activities" },
    { label: "Pricing", href: "/pricing" },
    { label: "Help", href: "/help" },
  ];

  // Get current plan name
  const currentPlan = customer?.products?.[0];
  const planName = currentPlan?.name || "Free";
  const isPaidPlan = planName !== "Free";

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token");

    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    if (error?.code) {
      toast.error("Failed to sign out");
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
      toast.success("Signed out successfully");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Plane className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">TravelHub</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Plan Badge - Always visible when logged in */}
            {session?.user && !customerLoading && (
              <Link href="/pricing">
                <Badge
                  variant={isPaidPlan ? "default" : "secondary"}
                  className="hidden md:flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {isPaidPlan ? (
                    <Crown className="h-3 w-3" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {planName}
                </Badge>
              </Link>
            )}

            {session?.user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
                  asChild
                >
                  <Link href="/favorites">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="hidden md:flex">
                      <User className="h-4 w-4 mr-2" />
                      {session.user.name || session.user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{session.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {session.user.email}
                        </span>
                        {!customerLoading && (
                          <Badge
                            variant={isPaidPlan ? "default" : "secondary"}
                            className="mt-2 w-fit"
                          >
                            {planName} Plan
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <UserCircle className="h-4 w-4 mr-2" />
                        Profile & Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="cursor-pointer">
                        <BookMarked className="h-4 w-4 mr-2" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="cursor-pointer">
                        <Heart className="h-4 w-4 mr-2" />
                        Favorites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing" className="cursor-pointer">
                        <Crown className="h-4 w-4 mr-2" />
                        View Plans
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/supplier" className="cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Supplier Portal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/help" className="cursor-pointer">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Help & Support
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden md:flex">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="hidden md:flex">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {session?.user ? (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Signed in as
                        </p>
                        <p className="font-medium">{session.user.email}</p>
                        {!customerLoading && (
                          <Badge
                            variant={isPaidPlan ? "default" : "secondary"}
                            className="mt-2"
                          >
                            {planName} Plan
                          </Badge>
                        )}
                      </div>
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <UserCircle className="h-4 w-4 mr-2" />
                          Profile
                        </Button>
                      </Link>
                      <Link href="/bookings" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <BookMarked className="h-4 w-4 mr-2" />
                          My Bookings
                        </Button>
                      </Link>
                      <Link href="/favorites" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Favorites
                        </Button>
                      </Link>
                      <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="mt-2"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild className="mt-4">
                        <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
