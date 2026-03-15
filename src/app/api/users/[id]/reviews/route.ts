import { NextRequest, NextResponse } from "next/server";
import { getReviewsForUser } from "@/services/reviews";
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from "@/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(PAGINATION_MAX_LIMIT, Math.max(1, parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULT_LIMIT))));
    const result = await getReviewsForUser(id, page, limit);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
