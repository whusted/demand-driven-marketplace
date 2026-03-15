import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { users, listings, reviews } from "@/db/schema";

export async function getUserProfile(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return null;

  const recentListings = await db
    .select()
    .from(listings)
    .where(eq(listings.buyerId, userId))
    .orderBy(desc(listings.createdAt))
    .limit(5);

  const recentReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.revieweeId, userId))
    .orderBy(desc(reviews.createdAt))
    .limit(5);

  return {
    ...user,
    recentListings,
    recentReviews,
  };
}

export async function updateProfile(
  userId: string,
  data: { displayName?: string; bio?: string; avatarUrl?: string; location?: string },
) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.displayName !== undefined) updateData.displayName = data.displayName;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  if (data.location !== undefined) updateData.location = data.location;

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();

  return updated;
}

export async function getAuthMe(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user ?? null;
}
