import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatPrice, formatDate } from "@/lib/utils";
import { getListingById } from "@/services/listings";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Images */}
      {listing.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {listing.images.map((img) => (
            <div key={img.id} className="aspect-square rounded-md overflow-hidden bg-muted">
              <img src={img.url} alt="" className="object-cover w-full h-full" />
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge>{listing.status}</Badge>
          {listing.condition !== "any" && (
            <Badge variant="outline">{listing.condition.replace("_", " ")}</Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold">{listing.title}</h1>
        <p className="text-lg font-semibold text-primary mt-1">
          {listing.maxPrice != null ? formatPrice(listing.maxPrice) : "Open to offers"}
        </p>
      </div>

      {/* Category breadcrumb */}
      {listing.category && (
        <p className="text-sm text-muted-foreground">{listing.category.name}</p>
      )}

      {/* Description */}
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap">{listing.description}</p>
      </div>

      {/* Tags */}
      {listing.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {listing.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/listings?tags=${tag.slug}`}
            >
              <Badge variant="secondary">{tag.name}</Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="text-sm text-muted-foreground space-y-1">
        {listing.location && <p>Location: {listing.location}</p>}
        <p>
          {listing.shippingOk ? "Shipping accepted" : ""}
          {listing.shippingOk && listing.localOnly ? " · " : ""}
          {listing.localOnly ? "Local pickup only" : ""}
        </p>
        <p>Posted {formatDate(listing.createdAt)}</p>
        <p>{listing.viewCount} views</p>
      </div>

      {/* Buyer profile */}
      {listing.buyer && (
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Avatar>
              <AvatarFallback>
                {(listing.buyer.displayName || listing.buyer.username)?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/profile/${listing.buyer.id}`} className="font-medium hover:underline">
                {listing.buyer.displayName || listing.buyer.username}
              </Link>
              <p className="text-xs text-muted-foreground">
                {listing.buyer.rating} rating · {listing.buyer.ratingCount} reviews
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {listing.status === "active" && (
          <Link href={`/listings/${id}/offers/new`} className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">
            Make an Offer
          </Link>
        )}
      </div>
    </div>
  );
}
