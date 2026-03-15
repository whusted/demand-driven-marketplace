import Link from "next/link";
import { ListingCard } from "@/components/listings/listing-card";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function ListingsBrowsePage() {
  const results = await db
    .select()
    .from(listings)
    .where(eq(listings.status, "active"))
    .orderBy(desc(listings.createdAt))
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wanted Listings</h1>
        <Link href="/listings/new" className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80">
          Post a Wanted Listing
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No listings yet</p>
          <p>Be the first to post what you&apos;re looking for!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      )}
    </div>
  );
}
