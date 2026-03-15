import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight mb-4">
        WantedBoard
      </h1>
      <p className="text-xl text-muted-foreground max-w-lg mb-8">
        The reverse marketplace for rare finds. Post what you want, get offers
        from sellers who have it.
      </p>
      <div className="flex gap-4">
        <Link href="/listings/new" className="inline-flex h-9 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80">
          Post a Wanted Listing
        </Link>
        <Link href="/listings" className="inline-flex h-9 items-center rounded-lg border px-2.5 text-sm font-medium hover:bg-muted">
          Browse Listings
        </Link>
      </div>
    </div>
  );
}
