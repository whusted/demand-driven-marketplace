import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAuthUser, AuthError } from "@/lib/supabase/auth";
import { createListingSchema } from "@/lib/validators/listings";
import { createListing } from "@/services/listings";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq, sql, desc, asc } from "drizzle-orm";
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const validation = createListingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid request", details: validation.error.issues } },
        { status: 400 },
      );
    }

    const listing = await createListing(validation.data, user.id);
    return NextResponse.json({ data: listing }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: error.message } },
        { status: 401 },
      );
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      PAGINATION_MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULT_LIMIT))),
    );
    const sort = searchParams.get("sort") || "newest";
    const status = searchParams.get("status") || "active";
    const offset = (page - 1) * limit;

    // Basic listing query — search/filter enhanced in US3
    const conditions = [eq(listings.status, status as "active" | "fulfilled" | "expired" | "closed")];

    const orderBy = sort === "price_asc"
      ? asc(listings.maxPrice)
      : sort === "price_desc"
        ? desc(listings.maxPrice)
        : desc(listings.createdAt);

    const results = await db
      .select()
      .from(listings)
      .where(conditions.length === 1 ? conditions[0] : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(listings)
      .where(conditions.length === 1 ? conditions[0] : undefined);

    return NextResponse.json({
      data: results,
      meta: { page, limit, total: Number(count) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 },
    );
  }
}
