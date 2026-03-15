"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagInput } from "@/components/listings/tag-input";
import { toast } from "sonner";

interface AlertFormProps {
  mode: "create" | "edit";
  alertId?: string;
  initialData?: { keywords?: string[]; tags?: string[] };
  onSuccess: () => void;
  onCancel?: () => void;
}

export function AlertForm({ mode, alertId, initialData, onSuccess, onCancel }: AlertFormProps) {
  const [keywords, setKeywords] = useState(initialData?.keywords?.join(", ") || "");
  const [alertTags, setAlertTags] = useState<string[]>(initialData?.tags || []);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = {
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      tags: alertTags,
    };

    try {
      const url = mode === "edit" ? `/api/alerts/${alertId}` : "/api/alerts";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to save alert");
      }

      toast.success(mode === "create" ? "Alert created!" : "Alert updated!");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{mode === "create" ? "New Alert" : "Edit Alert"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords (comma separated)</label>
            <Input
              placeholder="vintage, synthesizer, 1980s"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <TagInput value={alertTags} onChange={setAlertTags} placeholder="Add tags..." />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create Alert" : "Save"}
            </Button>
            {onCancel && (
              <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
