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
import { TagInput } from "@/components/listings/tag-input";
import { ImageUpload } from "@/components/listings/image-upload";
import { CONDITION } from "@/types";
import { MAX_IMAGES_PER_LISTING } from "@/lib/constants";
import { toast } from "sonner";

interface ListingFormProps {
  mode: "create" | "edit";
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    condition?: string;
    maxPrice?: number | null;
    location?: string | null;
    shippingOk?: boolean;
    localOnly?: boolean;
    tags?: string[];
    imageIds?: string[];
  };
}

export function ListingForm({ mode, initialData }: ListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [condition, setCondition] = useState(initialData?.condition || "any");
  const [maxPrice, setMaxPrice] = useState(
    initialData?.maxPrice != null ? String(initialData.maxPrice / 100) : "",
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [shippingOk, setShippingOk] = useState(initialData?.shippingOk ?? true);
  const [localOnly, setLocalOnly] = useState(initialData?.localOnly ?? false);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.imageIds || []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = {
      title,
      description,
      condition,
      maxPrice: maxPrice ? Math.round(parseFloat(maxPrice) * 100) : null,
      location: location || null,
      shippingOk,
      localOnly,
      tags,
      imageIds: imageUrls,
    };

    try {
      const url =
        mode === "edit" ? `/api/listings/${initialData?.id}` : "/api/listings";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to save listing");
      }

      const { data } = await res.json();
      toast.success(mode === "create" ? "Listing created!" : "Listing updated!");
      router.push(`/listings/${data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Post a Wanted Listing" : "Edit Listing"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              What are you looking for?
            </label>
            <Input
              id="title"
              placeholder="e.g., 1985 Prince Purple Rain tour shirt, size L"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={5}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe exactly what you're looking for, including specific details that matter..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Condition</label>
              <Select value={condition} onValueChange={(v) => v && setCondition(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "any" ? "Any condition" : c.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="maxPrice" className="text-sm font-medium">
                Max price (USD)
              </label>
              <Input
                id="maxPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="Leave blank for open to offers"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <Input
              id="location"
              placeholder="City, State"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={shippingOk}
                  onChange={(e) => setShippingOk(e.target.checked)}
                />
                Shipping OK
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={localOnly}
                  onChange={(e) => setLocalOnly(e.target.checked)}
                />
                Local pickup only
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <TagInput value={tags} onChange={setTags} />
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add a tag
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reference photos</label>
            <ImageUpload
              value={imageUrls}
              onChange={setImageUrls}
              maxImages={MAX_IMAGES_PER_LISTING}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Saving..."
              : mode === "create"
                ? "Post Listing"
                : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
