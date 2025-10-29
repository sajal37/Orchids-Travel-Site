"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Search, AlertTriangle, Shield } from "lucide-react";

interface NLSearchBoxProps {
  category: string;
  onSearch: (filters: any) => void;
}

export default function NLSearchBox({ category, onSearch }: NLSearchBoxProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/nl-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naturalLanguage: query,
          category,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (!data.data.isSafe) {
          setError(
            "Query contains unsafe patterns and was blocked for security."
          );
          return;
        }
        setParsedQuery(data.data.parsedQuery);
        onSearch(data.data.parsedQuery);
      } else {
        setError(data.error || "Failed to parse query");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const examples = {
    flights: [
      "Non-stop flights under 20000",
      "Business class flights",
      "Cheapest flights",
    ],
    hotels: [
      "Hotels with pool and spa",
      "5 star hotels under 15000",
      "Top rated hotels with free wifi",
    ],
    buses: ["Sleeper buses", "AC buses under 1500", "Fastest buses"],
    activities: [
      "Top 5 highest rated activities",
      "Activities under 1000",
      "Cultural activities",
    ],
  };

  const categoryExamples =
    examples[category as keyof typeof examples] || examples.flights;

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold">AI-Powered Smart Search</h3>
        </div>

        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: 'Show me non-stop flights under 20000' or 'Top rated hotels with pool'"
          rows={2}
          disabled={loading}
        />

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {parsedQuery && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-xs">
            <p className="font-semibold mb-2">Parsed Filters:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(parsedQuery, null, 2)}
            </pre>
          </div>
        )}

        <Button
          onClick={handleParse}
          disabled={loading || !query.trim()}
          className="w-full"
        >
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Processing..." : "Search with AI"}
        </Button>

        <div className="space-y-2">
          <p className="text-xs font-medium">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {categoryExamples.map((example, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900"
                onClick={() => setQuery(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          Safe query validation prevents SQL injection and XSS attacks
        </div>
      </CardContent>
    </Card>
  );
}
