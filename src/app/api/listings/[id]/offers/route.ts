import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/supabase/auth";
import { createOfferSchema } from "@/lib/validators/offers";
import { createOffer, getOffersForListing } from "@/services/offers";
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from "@/lib/constants";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(request);
    const { id: listingId } = await params;
    const body = await request.json();

    const validation = createOfferSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid request", details: validation.error.issues } },
        { status: 400 },
      );
    }

    const offer = await createOffer(validation.data, user.id, listingId);
    return NextResponse.json({ data: offer }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message.includes("own listing")) {
      return NextResponse.json({ error: { code: "FORBIDDEN", message } }, { status: 403 });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(request);
    const { id: listingId } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(PAGINATION_MAX_LIMIT, Math.max(1, parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULT_LIMIT))));

    const result = await getOffersForListing(listingId, user.id, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Not authorized") ? 403 : 500;
    return NextResponse.json({ error: { code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR", message } }, { status });
  }
}
