import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { reviews, offers, listings, users } from "@/db/schema";
import type { CreateReviewInput } from "@/lib/validators/reviews";

export async function createReview(reviewerId: string, data: CreateReviewInput) {
  // Verify offer is accepted
  const [result] = await db
    .select({ offer: offers, listing: listings })
    .from(offers)
    .innerJoin(listings, eq(offers.listingId, listings.id))
    .where(eq(offers.id, data.offerId));

  if (!result) throw new Error("Offer not found");
  if (result.offer.status !== "accepted") throw new Error("Can only review accepted offers");

  // Verify reviewer is buyer or seller
  const isBuyer = result.listing.buyerId === reviewerId;
  const isSeller = result.offer.sellerId === reviewerId;
  if (!isBuyer && !isSeller) throw new Error("Not authorized to review this offer");

  // Determine reviewee
  const revieweeId = isBuyer ? result.offer.sellerId : result.listing.buyerId;

  // Check for duplicate
  const [existing] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.reviewerId, reviewerId), eq(reviews.offerId, data.offerId)));

  if (existing) throw new Error("You have already reviewed this offer");

  // Insert review
  const [review] = await db
    .insert(reviews)
    .values({
      reviewerId,
      revieweeId,
      offerId: data.offerId,
      rating: data.rating,
      comment: data.comment ?? null,
    })
    .returning();

  // Update reviewee's rating (running average)
  const [reviewee] = await db.select().from(users).where(eq(users.id, revieweeId));
  if (reviewee) {
    const newCount = reviewee.ratingCount + 1;
    const currentTotal = parseFloat(reviewee.rating) * reviewee.ratingCount;
    const newRating = ((currentTotal + data.rating) / newCount).toFixed(2);

    await db
      .update(users)
      .set({ rating: newRating, ratingCount: newCount })
      .where(eq(users.id, revieweeId));
  }

  return review;
}

export async function getReviewsForUser(userId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const results = await db
    .select({
      review: reviews,
      reviewer: users,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.reviewerId, users.id))
    .where(eq(reviews.revieweeId, userId))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviews)
    .where(eq(reviews.revieweeId, userId));

  return {
    data: results.map((r) => ({
      ...r.review,
      reviewer: r.reviewer
        ? { id: r.reviewer.id, displayName: r.reviewer.displayName, username: r.reviewer.username, avatarUrl: r.reviewer.avatarUrl }
        : { id: null, displayName: "Deleted User", username: "deleted", avatarUrl: null },
    })),
    meta: { page, limit, total: Number(count) },
  };
}
