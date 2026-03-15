import { eq, and, desc, asc, sql, ilike, lte, gte } from "drizzle-orm";
import { db } from "@/db";
import { listings, tags, categories } from "@/db/schema";
import { PAGINATION_DEFAULT_LIMIT } from "@/lib/constants";

export interface SearchParams {
  q?: string;
  category?: string;
  tags?: string[];
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  localOnly?: boolean;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function searchListings(params: SearchParams) {
  const {
    q,
    category,
    tags: tagSlugs,
    condition,
    minPrice,
    maxPrice,
    location,
    localOnly,
    status = "active",
    sort = q ? "relevance" : "newest",
    page = 1,
    limit = PAGINATION_DEFAULT_LIMIT,
  } = params;

  const offset = (page - 1) * limit;
  const conditions: ReturnType<typeof eq>[] = [];

  // Status filter
  conditions.push(eq(listings.status, status as "active" | "fulfilled" | "expired" | "closed"));

  // Condition filter
  if (condition && condition !== "any") {
    conditions.push(eq(listings.condition, condition as "mint" | "near_mint" | "good" | "fair" | "poor"));
  }

  // Price range
  if (minPrice !== undefined) {
    conditions.push(gte(listings.maxPrice, minPrice));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(listings.maxPrice, maxPrice));
  }

  // Location
  if (location) {
    conditions.push(ilike(listings.location, `%${location}%`) as ReturnType<typeof eq>);
  }

  // Local only
  if (localOnly) {
    conditions.push(eq(listings.localOnly, true));
  }

  // Full-text search
  if (q) {
    const tsquery = q
      .trim()
      .split(/\s+/)
      .map((word) => `${word}:*`)
      .join(" & ");
    conditions.push(
      sql`listings.search_tsv @@ to_tsquery('english', ${tsquery})` as ReturnType<typeof eq>,
    );
  }

  // Category filter (by slug)
  if (category) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, category));
    if (cat) {
      conditions.push(eq(listings.categoryId, cat.id));
    }
  }

  // Tag filter — use subquery to avoid join type issues
  if (tagSlugs && tagSlugs.length > 0) {
    const matchingTags = await db
      .select({ id: tags.id })
      .from(tags)
      .where(sql`${tags.slug} = ANY(${tagSlugs})`);
    const tagFilterIds = matchingTags.map((t) => t.id);
    if (tagFilterIds.length > 0) {
      conditions.push(
        sql`${listings.id} IN (SELECT listing_id FROM listing_tags WHERE tag_id = ANY(${tagFilterIds}))` as ReturnType<typeof eq>,
      );
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Build query
  let query = db.select().from(listings).where(whereClause).$dynamic();

  // Sorting
  if (sort === "relevance" && q) {
    const tsquery = q
      .trim()
      .split(/\s+/)
      .map((word) => `${word}:*`)
      .join(" & ");
    query = query.orderBy(
      sql`ts_rank(listings.search_tsv, to_tsquery('english', ${tsquery})) DESC`,
    ) as typeof query;
  } else if (sort === "price_asc") {
    query = query.orderBy(asc(listings.maxPrice)) as typeof query;
  } else if (sort === "price_desc") {
    query = query.orderBy(desc(listings.maxPrice)) as typeof query;
  } else {
    query = query.orderBy(desc(listings.createdAt)) as typeof query;
  }

  const results = await query.limit(limit).offset(offset);

  // Count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(listings)
    .where(whereClause);

  return {
    data: results,
    meta: { page, limit, total: Number(count) },
  };
}
