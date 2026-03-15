import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  sellerAlerts,
  sellerAlertTags,
  tags,
  listings,
  listingTags,
  categories,
} from "@/db/schema";
import { MAX_ALERTS_PER_USER } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { CreateAlertInput } from "@/lib/validators/alerts";

export async function createAlert(userId: string, data: CreateAlertInput) {
  // Check limit
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sellerAlerts)
    .where(eq(sellerAlerts.userId, userId));

  if (Number(count) >= MAX_ALERTS_PER_USER) {
    throw new Error(`Maximum ${MAX_ALERTS_PER_USER} alerts allowed`);
  }

  return await db.transaction(async (tx) => {
    const [alert] = await tx
      .insert(sellerAlerts)
      .values({
        userId,
        categoryId: data.categoryId ?? null,
        keywords: data.keywords ?? [],
      })
      .returning();

    // Associate tags
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const slug = slugify(tagName);
        const [tag] = await tx
          .insert(tags)
          .values({ name: tagName.toLowerCase(), slug })
          .onConflictDoUpdate({
            target: tags.name,
            set: { name: tagName.toLowerCase() },
          })
          .returning();

        await tx.insert(sellerAlertTags).values({
          alertId: alert.id,
          tagId: tag.id,
        });
      }
    }

    return alert;
  });
}

export async function getMyAlerts(userId: string) {
  const alerts = await db
    .select()
    .from(sellerAlerts)
    .where(eq(sellerAlerts.userId, userId))
    .orderBy(sellerAlerts.createdAt);

  // Get tags and category for each alert
  const result = await Promise.all(
    alerts.map(async (alert) => {
      const alertTags = await db
        .select({ tag: tags })
        .from(sellerAlertTags)
        .innerJoin(tags, eq(sellerAlertTags.tagId, tags.id))
        .where(eq(sellerAlertTags.alertId, alert.id));

      const category = alert.categoryId
        ? await db
            .select()
            .from(categories)
            .where(eq(categories.id, alert.categoryId))
            .limit(1)
        : [];

      return {
        ...alert,
        tags: alertTags.map((r) => r.tag),
        category: category[0] ?? null,
      };
    }),
  );

  return result;
}

export async function updateAlert(
  alertId: string,
  userId: string,
  data: { categoryId?: string | null; keywords?: string[]; tags?: string[] },
) {
  const [existing] = await db
    .select()
    .from(sellerAlerts)
    .where(eq(sellerAlerts.id, alertId));

  if (!existing || existing.userId !== userId) {
    throw new Error("Not authorized");
  }

  const updateData: Record<string, unknown> = {};
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.keywords !== undefined) updateData.keywords = data.keywords;

  const [updated] = await db
    .update(sellerAlerts)
    .set(updateData)
    .where(eq(sellerAlerts.id, alertId))
    .returning();

  // Update tags if provided
  if (data.tags !== undefined) {
    await db.delete(sellerAlertTags).where(eq(sellerAlertTags.alertId, alertId));
    for (const tagName of data.tags) {
      const slug = slugify(tagName);
      const [tag] = await db
        .insert(tags)
        .values({ name: tagName.toLowerCase(), slug })
        .onConflictDoUpdate({
          target: tags.name,
          set: { name: tagName.toLowerCase() },
        })
        .returning();

      await db.insert(sellerAlertTags).values({ alertId, tagId: tag.id });
    }
  }

  return updated;
}

export async function deleteAlert(alertId: string, userId: string) {
  const [existing] = await db
    .select()
    .from(sellerAlerts)
    .where(eq(sellerAlerts.id, alertId));

  if (!existing || existing.userId !== userId) {
    throw new Error("Not authorized");
  }

  await db.delete(sellerAlerts).where(eq(sellerAlerts.id, alertId));
}

export async function matchAlertForListing(listingId: string) {
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId));

  if (!listing) return [];

  // Get listing tags
  const lTags = await db
    .select({ tagId: listingTags.tagId })
    .from(listingTags)
    .where(eq(listingTags.listingId, listingId));

  const listingTagIds = lTags.map((t) => t.tagId);

  // Get all alerts
  const allAlerts = await db.select().from(sellerAlerts);

  const matches: string[] = [];

  for (const alert of allAlerts) {
    // Skip if alert belongs to listing buyer
    if (alert.userId === listing.buyerId) continue;

    let matched = false;

    // Category match
    if (alert.categoryId && listing.categoryId === alert.categoryId) {
      matched = true;
    }

    // Keyword match
    if (!matched && alert.keywords && alert.keywords.length > 0) {
      const text = `${listing.title} ${listing.description}`.toLowerCase();
      if (alert.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
        matched = true;
      }
    }

    // Tag match
    if (!matched && listingTagIds.length > 0) {
      const alertTagRows = await db
        .select({ tagId: sellerAlertTags.tagId })
        .from(sellerAlertTags)
        .where(eq(sellerAlertTags.alertId, alert.id));

      const alertTagIds = alertTagRows.map((t) => t.tagId);
      if (alertTagIds.some((id) => listingTagIds.includes(id))) {
        matched = true;
      }
    }

    if (matched) {
      matches.push(alert.userId);
    }
  }

  return matches;
}
