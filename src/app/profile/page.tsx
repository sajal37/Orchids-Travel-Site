import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  BookOpen,
  CreditCard,
  Plane,
  Shield,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const faqCategories = [
    {
      id: "booking",
      icon: Plane,
      title: "Booking & Reservations",
      questions: [
        {
          q: "How do I book a flight or hotel?",
          a: "Simply use our search bar on the homepage to find your desired travel option. Select from the results, fill in your passenger details, and complete the payment to confirm your booking.",
        },
        {
          q: "Can I modify or cancel my booking?",
          a: 'Yes! Go to "My Bookings" in your account dashboard. You can view, modify, or cancel bookings based on the provider\'s cancellation policy. Some bookings may incur fees.',
        },
        {
          q: "How do I add items to my favorites?",
          a: "Click the heart icon on any flight, hotel, bus, or activity card to save it to your favorites. Access your favorites anytime from the navigation menu.",
        },
        {
          q: "What is the booking limit on different plans?",
          a: "Free plan: 5 bookings/month, Basic: 15 bookings/month, Pro: 50 bookings/month, Premium: Unlimited bookings.",
        },
      ],
    },
    {
      id: "payment",
      icon: CreditCard,
      title: "Payment & Billing",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit/debit cards (Visa, MasterCard, American Express), UPI, net banking, and digital wallets. Payments are processed securely through Stripe.",
        },
        {
          q: "Is my payment information secure?",
          a: "Absolutely! We use industry-standard encryption (SSL/TLS) and never store your complete card details. All transactions are PCI-DSS compliant.",
        },
        {
          q: "How do refunds work?",
          a: "Refunds are processed according to the cancellation policy of your booking. Eligible refunds are typically processed within 5-7 business days to your original payment method.",
        },
        {
          q: "Can I get an invoice for my booking?",
          a: "Yes! Visit the billing portal from your profile page to download invoices for all your bookings and subscription payments.",
        },
      ],
    },
    {
      id: "account",
      icon: Shield,
      title: "Account & Subscription",
      questions: [
        {
          q: "How do I create an account?",
          a: 'Click "Sign Up" in the top navigation, enter your details, and verify your email. You can also sign up using your Google account for faster registration.',
        },
        {
          q: "What are the subscription plans?",
          a: "We offer Free, Basic (₹499/month), Pro (₹999/month), and Premium (₹1,999/month) plans with increasing booking limits and features. Visit the Pricing page for details.",
        },
        {
          q: "How do I upgrade my subscription?",
          a: "Go to the Pricing page or your Profile settings, select your desired plan, and complete the payment. Your upgrade is instant!",
        },
        {
          q: "Can I downgrade or cancel my subscription?",
          a: "Yes, you can change your plan anytime from your profile settings. Downgrades take effect at the end of your current billing cycle.",
        },
      ],
    },
    {
      id: "ai-features",
      icon: HelpCircle,
      title: "AI Features",
      questions: [
        {
          q: "How does AI-powered search work?",
          a: "Our AI analyzes your search preferences, past bookings, and current trends to provide personalized recommendations that match your style and budget.",
        },
        {
          q: "What is natural language filtering?",
          a: 'You can search using everyday language like "cheap flights to Goa under ₹5000" or "5-star hotels in Mumbai" and our AI will understand and filter results accordingly.',
        },
        {
          q: "How accurate are the AI recommendations?",
          a: "Our AI learns from millions of bookings and user preferences with 92% satisfaction rate. Recommendations improve as you use the platform more.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-xl text-blue-100 mb-6">
              Find answers to common questions or get in touch with our support
              team
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                className="pl-10 bg-white dark:bg-gray-800"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Chat with our support team
                </p>
                <Badge variant="secondary">Available 24/7</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Mail className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  support@travelhub.com
                </p>
                <Badge variant="secondary">Response in 24h</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Phone className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  1800-123-4567
                </p>
                <Badge variant="secondary">Mon-Sat 9AM-9PM</Badge>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Sections */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              {faqCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="h-5 w-5 text-primary" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, idx) => (
                        <AccordionItem key={idx} value={`item-${idx}`}>
                          <AccordionTrigger className="text-left">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Resources */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8 text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-6">
              Our support team is here to assist you with any questions or
              concerns
            </p>
            <div className="flex gap-4 justify-center">
              <Button>Contact Support</Button>
              <Button variant="outline" asChild>
                <Link href="/about">About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
