"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ListingForm } from "@/components/listings/listing-form";

export default function EditListingPage() {
  const params = useParams();
  const [listing, setListing] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListing() {
      const res = await fetch(`/api/listings/${params.id}`);
      if (res.ok) {
        const { data } = await res.json();
        setListing(data);
      }
      setLoading(false);
    }
    fetchListing();
  }, [params.id]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!listing) return <div className="text-center py-12">Listing not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <ListingForm
        mode="edit"
        initialData={{
          id: listing.id as string,
          title: listing.title as string,
          description: listing.description as string,
          condition: listing.condition as string,
          maxPrice: listing.maxPrice as number | null,
          location: listing.location as string | null,
          shippingOk: listing.shippingOk as boolean,
          localOnly: listing.localOnly as boolean,
          tags: ((listing.tags as { name: string }[]) || []).map((t) => t.name),
          imageIds: ((listing.images as { url: string }[]) || []).map((i) => i.url),
        }}
      />
    </div>
  );
}
