"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Eye,
  Undo2,
  AlertTriangle,
} from "lucide-react";

interface AIContentEditorProps {
  targetType: "flight" | "hotel" | "bus" | "activity";
  targetId: string;
  onSuccess?: () => void;
}

export default function AIContentEditor({
  targetType,
  targetId,
  onSuccess,
}: AIContentEditorProps) {
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGeneratePreview = async () => {
    if (!command.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/ai/content-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          naturalLanguageCommand: command,
          userId: "user123", // Mock user ID
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPreview(data.data);
        setSuccess("Preview generated successfully! Review changes below.");
      } else {
        setError(data.error || "Failed to generate preview");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!preview) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/content-edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editId: preview.id,
          action: "apply",
          userId: "user123",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Changes applied successfully! ✅");
        setPreview(null);
        setCommand("");
        onSuccess?.();
      } else {
        setError(data.error || "Failed to apply changes");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!preview) return;

    setLoading(true);

    try {
      const response = await fetch("/api/ai/content-edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editId: preview.id,
          action: "reject",
          userId: "user123",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPreview(null);
        setCommand("");
        setSuccess("Changes rejected");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderDiff = () => {
    if (!preview) return null;

    const { originalContent, proposedContent, changes } = preview;

    return (
      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Preview Changes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Badge variant="secondary">Original</Badge>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm space-y-2">
              {changes.map((key: string) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span>{" "}
                  <span className="line-through text-red-600">
                    {JSON.stringify(originalContent[key])}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Badge variant="default">Proposed</Badge>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-sm space-y-2">
              {changes.map((key: string) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span>{" "}
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    {JSON.stringify(proposedContent[key])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Content Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Natural Language Command
          </label>
          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g., 'Decrease price by 2000', 'Add 5 more seats', 'Mark as unavailable'"
            rows={3}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use plain English to describe the changes you want to make
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-600 text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!preview ? (
          <Button
            onClick={handleGeneratePreview}
            disabled={loading || !command.trim()}
            className="w-full"
          >
            {loading ? "Generating Preview..." : "Generate Preview"}
          </Button>
        ) : (
          <>
            <Separator />
            {renderDiff()}
            <div className="flex gap-2">
              <Button
                onClick={handleApply}
                disabled={loading}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Changes
              </Button>
              <Button
                onClick={handleReject}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs space-y-1">
          <p className="font-semibold">🛡️ Safety Features:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Preview before apply - see changes first</li>
            <li>Human approval required - no automatic changes</li>
            <li>Full audit trail - all changes are logged</li>
            <li>Rollback support - undo changes anytime</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
