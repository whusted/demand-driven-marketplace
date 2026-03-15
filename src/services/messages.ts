import { eq, and, asc, lt, ne, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { messages, offers, listings } from "@/db/schema";

export async function getMessagesForOffer(
  offerId: string,
  userId: string,
  options?: { limit?: number; before?: string },
) {
  // Verify user is buyer or seller
  const [result] = await db
    .select({ offer: offers, listing: listings })
    .from(offers)
    .innerJoin(listings, eq(offers.listingId, listings.id))
    .where(eq(offers.id, offerId));

  if (!result) throw new Error("Offer not found");
  if (result.offer.sellerId !== userId && result.listing.buyerId !== userId) {
    throw new Error("Not authorized to view messages");
  }

  const limit = options?.limit ?? 50;
  const conditions = [eq(messages.offerId, offerId)];

  if (options?.before) {
    conditions.push(lt(messages.createdAt, new Date(options.before)));
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(asc(messages.createdAt))
    .limit(limit);

  return msgs;
}

export async function sendMessage(
  offerId: string,
  userId: string,
  body: string,
  imageUrl?: string | null,
) {
  // Verify user is buyer or seller
  const [result] = await db
    .select({ offer: offers, listing: listings })
    .from(offers)
    .innerJoin(listings, eq(offers.listingId, listings.id))
    .where(eq(offers.id, offerId));

  if (!result) throw new Error("Offer not found");
  if (result.offer.sellerId !== userId && result.listing.buyerId !== userId) {
    throw new Error("Not authorized to send messages");
  }

  const [message] = await db
    .insert(messages)
    .values({
      offerId,
      senderId: userId,
      body,
      imageUrl: imageUrl ?? null,
    })
    .returning();

  return message;
}

export async function markMessagesAsRead(offerId: string, userId: string) {
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.offerId, offerId),
        ne(messages.senderId, userId),
        isNull(messages.readAt),
      ),
    );
}
