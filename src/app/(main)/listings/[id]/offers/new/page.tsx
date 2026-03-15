"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { OfferForm } from "@/components/offers/offer-form";

export default function SubmitOfferPage() {
  const params = useParams();
  const [listingTitle, setListingTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListing() {
      const res = await fetch(`/api/listings/${params.id}`);
      if (res.ok) {
        const { data } = await res.json();
        setListingTitle(data.title);
      }
      setLoading(false);
    }
    fetchListing();
  }, [params.id]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <OfferForm listingId={params.id as string} listingTitle={listingTitle} />
    </div>
  );
}
