import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/supabase/auth";
import { declineOffer } from "@/services/offers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const updated = await declineOffer(id, user.id);
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Not authorized") ? 403 : message.includes("not pending") ? 400 : 500;
    return NextResponse.json({ error: { code: status === 403 ? "FORBIDDEN" : status === 400 ? "BAD_REQUEST" : "INTERNAL_ERROR", message } }, { status });
  }
}
