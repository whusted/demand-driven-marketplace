"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ListingCard } from "@/components/listings/listing-card";
import { SearchBar } from "@/components/listings/search-bar";
import { FilterSidebar } from "@/components/listings/filter-sidebar";

interface ListingResult {
  id: string;
  title: string;
  description: string;
  maxPrice: number | null;
  condition: string;
  location: string | null;
  createdAt: string;
}

export function ListingsBrowse() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<ListingResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const res = await fetch(`/api/listings?${searchParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.data);
        setTotal(data.meta.total);
      }
      setLoading(false);
    }
    fetchListings();
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wanted Listings</h1>
        <Link
          href="/listings/new"
          className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Post a Wanted Listing
        </Link>
      </div>

      <SearchBar />

      <div className="flex gap-6">
        <FilterSidebar />

        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No results found</p>
              <p>Try broadening your search or create a seller alert to get notified.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">{total} results</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    id={listing.id}
                    title={listing.title}
                    description={listing.description}
                    maxPrice={listing.maxPrice}
                    condition={listing.condition}
                    location={listing.location}
                    createdAt={listing.createdAt}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
