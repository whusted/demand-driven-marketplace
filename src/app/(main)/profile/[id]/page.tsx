import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ReviewCard } from "@/components/profile/review-card";
import { ListingCard } from "@/components/listings/listing-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserProfile } from "@/services/users";
import { getReviewsForUser } from "@/services/reviews";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getUserProfile(id);
  if (!profile) notFound();

  const reviewsResult = await getReviewsForUser(id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ProfileHeader
        displayName={profile.displayName}
        username={profile.username}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
        location={profile.location}
        rating={profile.rating}
        ratingCount={profile.ratingCount}
        createdAt={profile.createdAt.toISOString()}
      />

      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">Listings ({profile.recentListings.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviewsResult.meta.total})</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          {profile.recentListings.length === 0 ? (
            <p className="text-muted-foreground py-4">No listings yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.recentListings.map((listing) => (
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
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {reviewsResult.data.length === 0 ? (
            <p className="text-muted-foreground py-4">No reviews yet</p>
          ) : (
            reviewsResult.data.map((review) => (
              <ReviewCard
                key={review.id}
                rating={review.rating}
                comment={review.comment}
                reviewer={review.reviewer}
                createdAt={review.createdAt.toISOString()}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
