import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/supabase/auth";
import { createListingSchema } from "@/lib/validators/listings";
import { createListing } from "@/services/listings";
import { searchListings } from "@/services/search";
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

    const tagsParam = searchParams.get("tags");

    const result = await searchListings({
      q: searchParams.get("q") || undefined,
      category: searchParams.get("category") || undefined,
      tags: tagsParam ? tagsParam.split(",") : undefined,
      condition: searchParams.get("condition") || undefined,
      minPrice: searchParams.get("min_price") ? parseInt(searchParams.get("min_price")!) : undefined,
      maxPrice: searchParams.get("max_price") ? parseInt(searchParams.get("max_price")!) : undefined,
      location: searchParams.get("location") || undefined,
      localOnly: searchParams.get("local_only") === "true",
      status: searchParams.get("status") || "active",
      sort: searchParams.get("sort") || undefined,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 },
    );
  }
}
