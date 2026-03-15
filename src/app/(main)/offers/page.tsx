"use client";

import { useEffect, useState } from "react";
import { OfferCard } from "@/components/offers/offer-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MyOffer {
  id: string;
  price: number;
  condition: string;
  description: string;
  status: string;
  listingId: string;
  listing: { title: string; maxPrice: number | null };
}

export default function MyOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<MyOffer[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOffers() {
    const res = await fetch("/api/users/me/offers");
    if (res.ok) {
      const result = await res.json();
      setOffers(result.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOffers();
  }, []);

  async function handleWithdraw(offerId: string) {
    const res = await fetch(`/api/offers/${offerId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Offer withdrawn");
      fetchOffers();
    } else {
      const err = await res.json();
      toast.error(err.error?.message || "Failed to withdraw");
    }
  }

  if (loading) return <div className="text-center py-12">Loading your offers...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Offers</h1>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({offers.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
          <TabsTrigger value="withdrawn">Withdrawn</TabsTrigger>
        </TabsList>

        {["all", "pending", "accepted", "declined", "withdrawn"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {offers
              .filter((o) => tab === "all" || o.status === tab)
              .map((offer) => (
                <OfferCard
                  key={offer.id}
                  id={offer.id}
                  price={offer.price}
                  condition={offer.condition}
                  description={offer.description}
                  status={offer.status}
                  listingTitle={offer.listing.title}
                  listingMaxPrice={offer.listing.maxPrice}
                  role="seller"
                  onWithdraw={() => handleWithdraw(offer.id)}
                  onClick={() => router.push(`/listings/${offer.listingId}`)}
                />
              ))}
            {offers.filter((o) => tab === "all" || o.status === tab).length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No {tab === "all" ? "" : tab} offers</p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
