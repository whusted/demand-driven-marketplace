import { Suspense } from "react";
import { ListingsBrowse } from "@/components/listings/listings-browse";

export default function ListingsBrowsePage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <ListingsBrowse />
    </Suspense>
  );
}
