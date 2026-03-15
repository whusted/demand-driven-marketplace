"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/listings/image-upload";
import { OFFER_CONDITION } from "@/types";
import { MAX_IMAGES_PER_OFFER } from "@/lib/constants";
import { toast } from "sonner";

interface OfferFormProps {
  listingId: string;
  listingTitle: string;
}

export function OfferForm({ listingId, listingTitle }: OfferFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/listings/${listingId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Math.round(parseFloat(price) * 100),
          condition,
          description,
          shippingMethod: shippingMethod || null,
          imageIds: imageUrls,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to submit offer");
      }

      toast.success("Offer submitted!");
      router.push(`/listings/${listingId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make an Offer</CardTitle>
        <p className="text-sm text-muted-foreground">
          Responding to: {listingTitle}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Asking price (USD)
              </label>
              <Input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Condition</label>
              <Select value={condition} onValueChange={(v) => v && setCondition(v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {OFFER_CONDITION.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe the item you have — condition details, provenance, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="shipping" className="text-sm font-medium">
              Shipping method
            </label>
            <Input
              id="shipping"
              placeholder="e.g., USPS Priority Mail, insured"
              value={shippingMethod}
              onChange={(e) => setShippingMethod(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Photos of your item (at least 1 required)
            </label>
            <ImageUpload
              value={imageUrls}
              onChange={setImageUrls}
              maxImages={MAX_IMAGES_PER_OFFER}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || imageUrls.length === 0}>
            {loading ? "Submitting..." : "Submit Offer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
