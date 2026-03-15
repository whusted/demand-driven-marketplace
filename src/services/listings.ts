import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  listings,
  listingImages,
  listingTags,
  tags,
  users,
  categories,
} from "@/db/schema";
import { slugify } from "@/lib/utils";
import type { CreateListingInput, UpdateListingInput } from "@/lib/validators/listings";
import { matchAlertForListing } from "@/services/alerts";

export async function createListing(data: CreateListingInput, userId: string) {
  const listing = await db.transaction(async (tx) => {
    // Insert the listing
    const [listing] = await tx
      .insert(listings)
      .values({
        buyerId: userId,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId ?? null,
        condition: data.condition ?? "any",
        maxPrice: data.maxPrice ?? null,
        currency: data.currency ?? "USD",
        location: data.location ?? null,
        shippingOk: data.shippingOk ?? true,
        localOnly: data.localOnly ?? false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      })
      .returning();

    // Associate images
    if (data.imageIds && data.imageIds.length > 0) {
      await tx.insert(listingImages).values(
        data.imageIds.map((url, i) => ({
          listingId: listing.id,
          url,
          sortOrder: i,
        })),
      );
    }

    // Create/find tags and associate
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const slug = slugify(tagName);
        // Upsert tag
        const [tag] = await tx
          .insert(tags)
          .values({ name: tagName.toLowerCase(), slug })
          .onConflictDoUpdate({
            target: tags.name,
            set: { name: tagName.toLowerCase() },
          })
          .returning();

        await tx.insert(listingTags).values({
          listingId: listing.id,
          tagId: tag.id,
        });
      }
    }

    // Update search vector
    await tx.execute(
      sql`UPDATE listings SET search_tsv = to_tsvector('english', ${listing.title} || ' ' || ${listing.description}) WHERE id = ${listing.id}`,
    );

    return listing;
  });

  // Fire-and-forget alert matching (don't block listing creation)
  matchAlertForListing(listing!.id).catch(() => {
    // Silently ignore matching errors — alerts are best-effort
  });

  return listing;
}

export async function getListingById(id: string) {
  const listing = await db
    .select()
    .from(listings)
    .where(eq(listings.id, id))
    .limit(1);

  if (listing.length === 0) return null;

  const images = await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, id))
    .orderBy(listingImages.sortOrder);

  const listingTagRows = await db
    .select({ tag: tags })
    .from(listingTags)
    .innerJoin(tags, eq(listingTags.tagId, tags.id))
    .where(eq(listingTags.listingId, id));

  const buyer = await db
    .select()
    .from(users)
    .where(eq(users.id, listing[0].buyerId))
    .limit(1);

  const category = listing[0].categoryId
    ? await db
        .select()
        .from(categories)
        .where(eq(categories.id, listing[0].categoryId))
        .limit(1)
    : [];

  // Increment view count
  await db
    .update(listings)
    .set({ viewCount: sql`${listings.viewCount} + 1` })
    .where(eq(listings.id, id));

  return {
    ...listing[0],
    images,
    tags: listingTagRows.map((r) => r.tag),
    buyer: buyer[0] ?? null,
    category: category[0] ?? null,
  };
}

export async function updateListing(
  id: string,
  data: UpdateListingInput,
  userId: string,
) {
  // Verify ownership
  const [existing] = await db
    .select({ buyerId: listings.buyerId })
    .from(listings)
    .where(eq(listings.id, id));

  if (!existing || existing.buyerId !== userId) {
    throw new Error("Not authorized to update this listing");
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.condition !== undefined) updateData.condition = data.condition;
  if (data.maxPrice !== undefined) updateData.maxPrice = data.maxPrice;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.shippingOk !== undefined) updateData.shippingOk = data.shippingOk;
  if (data.localOnly !== undefined) updateData.localOnly = data.localOnly;
  if (data.expiresAt !== undefined)
    updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

  const [updated] = await db
    .update(listings)
    .set(updateData)
    .where(eq(listings.id, id))
    .returning();

  // Update search vector if title or description changed
  if (data.title !== undefined || data.description !== undefined) {
    await db.execute(
      sql`UPDATE listings SET search_tsv = to_tsvector('english', ${updated.title} || ' ' || ${updated.description}) WHERE id = ${updated.id}`,
    );
  }

  return updated;
}

export async function closeListing(id: string, userId: string) {
  const [existing] = await db
    .select({ buyerId: listings.buyerId })
    .from(listings)
    .where(eq(listings.id, id));

  if (!existing || existing.buyerId !== userId) {
    throw new Error("Not authorized");
  }

  const [updated] = await db
    .update(listings)
    .set({ status: "closed", updatedAt: new Date() })
    .where(eq(listings.id, id))
    .returning();

  return updated;
}

export async function reopenListing(id: string, userId: string) {
  const [existing] = await db
    .select({ buyerId: listings.buyerId, status: listings.status })
    .from(listings)
    .where(eq(listings.id, id));

  if (!existing || existing.buyerId !== userId) {
    throw new Error("Not authorized");
  }

  if (!["fulfilled", "closed", "expired"].includes(existing.status)) {
    throw new Error("Listing is already active");
  }

  const [updated] = await db
    .update(listings)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(listings.id, id))
    .returning();

  return updated;
}
