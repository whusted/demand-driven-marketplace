import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { offers, offerImages, listings, users } from "@/db/schema";
import type { CreateOfferInput } from "@/lib/validators/offers";

export async function createOffer(
  data: CreateOfferInput,
  sellerId: string,
  listingId: string,
) {
  // Verify listing exists and is active
  const [listing] = await db
    .select({ buyerId: listings.buyerId, status: listings.status })
    .from(listings)
    .where(eq(listings.id, listingId));

  if (!listing) throw new Error("Listing not found");
  if (listing.status !== "active") throw new Error("Listing is not active");
  if (listing.buyerId === sellerId) throw new Error("Cannot offer on your own listing");

  return await db.transaction(async (tx) => {
    const [offer] = await tx
      .insert(offers)
      .values({
        listingId,
        sellerId,
        price: data.price,
        currency: "USD",
        condition: data.condition,
        description: data.description,
        shippingMethod: data.shippingMethod ?? null,
      })
      .returning();

    if (data.imageIds.length > 0) {
      await tx.insert(offerImages).values(
        data.imageIds.map((url, i) => ({
          offerId: offer.id,
          url,
          sortOrder: i,
        })),
      );
    }

    return offer;
  });
}

export async function getOffersForListing(
  listingId: string,
  buyerId: string,
  page = 1,
  limit = 20,
) {
  // Verify requester is the listing buyer
  const [listing] = await db
    .select({ buyerId: listings.buyerId })
    .from(listings)
    .where(eq(listings.id, listingId));

  if (!listing || listing.buyerId !== buyerId) {
    throw new Error("Not authorized to view offers on this listing");
  }

  const offset = (page - 1) * limit;

  const results = await db
    .select({
      offer: offers,
      seller: users,
    })
    .from(offers)
    .innerJoin(users, eq(offers.sellerId, users.id))
    .where(eq(offers.listingId, listingId))
    .orderBy(desc(offers.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(offers)
    .where(eq(offers.listingId, listingId));

  // Get images for each offer
  const offerIds = results.map((r) => r.offer.id);
  const images =
    offerIds.length > 0
      ? await db
          .select()
          .from(offerImages)
          .where(sql`${offerImages.offerId} = ANY(${offerIds})`)
      : [];

  return {
    data: results.map((r) => ({
      ...r.offer,
      seller: r.seller,
      images: images.filter((img) => img.offerId === r.offer.id),
    })),
    meta: { page, limit, total: Number(count) },
  };
}

export async function getOfferById(offerId: string, userId: string) {
  const [result] = await db
    .select({ offer: offers, listing: listings })
    .from(offers)
    .innerJoin(listings, eq(offers.listingId, listings.id))
    .where(eq(offers.id, offerId));

  if (!result) return null;

  // Only buyer or seller can view
  if (result.offer.sellerId !== userId && result.listing.buyerId !== userId) {
    throw new Error("Not authorized to view this offer");
  }

  const images = await db
    .select()
    .from(offerImages)
    .where(eq(offerImages.offerId, offerId))
    .orderBy(offerImages.sortOrder);

  const [seller] = await db
    .select()
    .from(users)
    .where(eq(users.id, result.offer.sellerId));

  return {
    ...result.offer,
    listing: result.listing,
    seller,
    images,
  };
}

export async function acceptOffer(offerId: string, userId: string) {
  const [result] = await db
    .select({ offer: offers, listing: listings })
    .from(offers)
    .innerJoin(listings, eq(offers.listingId, listings.id))
    .where(eq(offers.id, offerId));

  if (!result) throw new Error("Offer not found");
  if (result.listing.buyerId !== userId) throw new Error("Not authorized");
  if (result.offer.status !== "pending") throw new Error("Offer is not pending");

  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(offers)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(offers.id, offerId))
      .returning();

    await tx
      .update(listings)
      .set({ status: "fulfilled", updatedAt: new Date() })
      .where(eq(listings.id, result.offer.listingId));

    return updated;
  });
}

export async function declineOffer(offerId: string, userId: string) {
  const [result] = await db
    .select({ offer: offers, listing: listings })
    .from(offers)
    .innerJoin(listings, eq(offers.listingId, listings.id))
    .where(eq(offers.id, offerId));

  if (!result) throw new Error("Offer not found");
  if (result.listing.buyerId !== userId) throw new Error("Not authorized");
  if (result.offer.status !== "pending") throw new Error("Offer is not pending");

  const [updated] = await db
    .update(offers)
    .set({ status: "declined", updatedAt: new Date() })
    .where(eq(offers.id, offerId))
    .returning();

  return updated;
}

export async function withdrawOffer(offerId: string, userId: string) {
  const [offer] = await db
    .select()
    .from(offers)
    .where(eq(offers.id, offerId));

  if (!offer) throw new Error("Offer not found");
  if (offer.sellerId !== userId) throw new Error("Not authorized");
  if (offer.status !== "pending") throw new Error("Can only withdraw pending offers");

  const [updated] = await db
    .update(offers)
    .set({ status: "withdrawn", updatedAt: new Date() })
    .where(eq(offers.id, offerId))
    .returning();

  return updated;
}

export async function getMyOffers(
  userId: string,
  status?: string,
  page = 1,
  limit = 20,
) {
  const offset = (page - 1) * limit;

  const conditions = [eq(offers.sellerId, userId)];
  if (status) {
    conditions.push(eq(offers.status, status as "pending" | "accepted" | "declined" | "withdrawn"));
  }

  const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

  const results = await db
    .select({ offer: offers, listing: listings })
    .from(offers)
    .innerJoin(listings, eq(offers.listingId, listings.id))
    .where(whereClause)
    .orderBy(desc(offers.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(offers)
    .where(whereClause);

  return {
    data: results.map((r) => ({ ...r.offer, listing: r.listing })),
    meta: { page, limit, total: Number(count) },
  };
}
