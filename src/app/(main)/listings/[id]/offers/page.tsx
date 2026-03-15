"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { OfferCard } from "@/components/offers/offer-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface OfferData {
  id: string;
  price: number;
  condition: string;
  description: string;
  status: string;
  images: { url: string }[];
  seller: { displayName: string | null; username: string; rating: string; avatarUrl: string | null };
}

export default function ListingOffersPage() {
  const params = useParams();
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOffers() {
    const res = await fetch(`/api/listings/${params.id}/offers`);
    if (res.ok) {
      const result = await res.json();
      setOffers(result.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOffers();
  }, [params.id]);

  async function handleAction(offerId: string, action: "accept" | "decline") {
    const res = await fetch(`/api/offers/${offerId}/${action}`, { method: "POST" });
    if (res.ok) {
      toast.success(`Offer ${action}ed`);
      fetchOffers();
    } else {
      const err = await res.json();
      toast.error(err.error?.message || "Action failed");
    }
  }

  if (loading) return <div className="text-center py-12">Loading offers...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Offers on your listing</h1>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({offers.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({offers.filter((o) => o.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({offers.filter((o) => o.status === "accepted").length})</TabsTrigger>
          <TabsTrigger value="declined">Declined ({offers.filter((o) => o.status === "declined").length})</TabsTrigger>
        </TabsList>

        {["all", "pending", "accepted", "declined"].map((tab) => (
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
                  images={offer.images}
                  seller={offer.seller}
                  role="buyer"
                  onAccept={() => handleAction(offer.id, "accept")}
                  onDecline={() => handleAction(offer.id, "decline")}
                />
              ))}
            {offers.filter((o) => tab === "all" || o.status === tab).length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No {tab === "all" ? "" : tab} offers yet</p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
