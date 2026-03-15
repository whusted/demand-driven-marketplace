"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CONDITION } from "@/types";

interface Category {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, []);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/listings?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/listings");
  }

  const hasFilters = searchParams.toString() !== "";

  return (
    <div className="space-y-4 w-60">
      <h3 className="font-semibold text-sm">Filters</h3>

      {/* Category */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Category</label>
        <Select
          value={searchParams.get("category") || ""}
          onValueChange={(v) => updateParam("category", v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <div key={cat.id}>
                <SelectItem value={cat.slug}>{cat.name}</SelectItem>
                {cat.children.map((child) => (
                  <SelectItem key={child.id} value={child.slug}>
                    &nbsp;&nbsp;{child.name}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Condition</label>
        <Select
          value={searchParams.get("condition") || ""}
          onValueChange={(v) => updateParam("condition", v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any condition" />
          </SelectTrigger>
          <SelectContent>
            {CONDITION.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "any" ? "Any" : c.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price range */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Price range</label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="w-full"
            defaultValue={searchParams.get("min_price") || ""}
            onBlur={(e) => updateParam("min_price", e.target.value || null)}
          />
          <Input
            type="number"
            placeholder="Max"
            className="w-full"
            defaultValue={searchParams.get("max_price") || ""}
            onBlur={(e) => updateParam("max_price", e.target.value || null)}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Location</label>
        <Input
          placeholder="City or region"
          defaultValue={searchParams.get("location") || ""}
          onBlur={(e) => updateParam("location", e.target.value || null)}
        />
      </div>

      {/* Local only */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={searchParams.get("local_only") === "true"}
          onChange={(e) => updateParam("local_only", e.target.checked ? "true" : null)}
        />
        Local pickup only
      </label>

      {/* Sort */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Sort by</label>
        <Select
          value={searchParams.get("sort") || "newest"}
          onValueChange={(v) => updateParam("sort", v || null)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price_asc">Price: low to high</SelectItem>
            <SelectItem value="price_desc">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          Clear filters
        </Button>
      )}
    </div>
  );
}
