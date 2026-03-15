"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ReviewFormProps {
  offerId: string;
  onSuccess: () => void;
}

export function ReviewForm({ offerId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, rating, comment: comment || null }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to submit review");
      }
      toast.success("Review submitted!");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-4">
      <p className="text-sm font-medium">Leave a review</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl ${star <= rating ? "text-amber-500" : "text-muted-foreground/30"}`}
          >
            ★
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Optional comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
      />
      <Button type="submit" size="sm" disabled={loading || rating === 0}>
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
