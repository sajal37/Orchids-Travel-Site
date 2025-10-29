import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "@/visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import CustomAutumnProvider from "@/lib/autumn-provider";

export const metadata: Metadata = {
  title: "TravelHub - Your Travel Companion",
  description:
    "Book flights, hotels, buses, and activities with AI-powered recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <ErrorReporter />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "TravelHub", "version": "1.0.0"}'
          />
          <CustomAutumnProvider>{children}</CustomAutumnProvider>
          <Toaster />
          <VisualEditsMessenger />
        </ErrorBoundary>
      </body>
    </html>
  );
}
