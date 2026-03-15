import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/supabase/auth";
import { getMyOffers } from "@/services/offers";
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(PAGINATION_MAX_LIMIT, Math.max(1, parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULT_LIMIT))));
    const status = searchParams.get("status") || undefined;

    const result = await getMyOffers(user.id, status, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
