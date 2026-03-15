import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tags, listingTags } from "@/db/schema";
import { ilike, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    let query = db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        count: sql<number>`count(${listingTags.listingId})`,
      })
      .from(tags)
      .leftJoin(listingTags, sql`${tags.id} = ${listingTags.tagId}`)
      .groupBy(tags.id, tags.name, tags.slug)
      .orderBy(desc(sql`count(${listingTags.listingId})`))
      .limit(20)
      .$dynamic();

    if (q) {
      query = query.where(ilike(tags.name, `%${q}%`)) as typeof query;
    }

    const results = await query;
    return NextResponse.json({ data: results });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch tags" } },
      { status: 500 },
    );
  }
}
