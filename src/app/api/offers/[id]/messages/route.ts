import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/supabase/auth";
import { createMessageSchema } from "@/lib/validators/messages";
import { getMessagesForOffer, sendMessage, markMessagesAsRead } from "@/services/messages";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(request);
    const { id: offerId } = await params;
    const { searchParams } = new URL(request.url);
    const before = searchParams.get("before") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");

    const msgs = await getMessagesForOffer(offerId, user.id, { limit, before });

    // Mark as read when fetching
    await markMessagesAsRead(offerId, user.id);

    return NextResponse.json({ data: msgs });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Not authorized") ? 403 : 500;
    return NextResponse.json({ error: { code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR", message } }, { status });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(request);
    const { id: offerId } = await params;
    const body = await request.json();

    const validation = createMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid request", details: validation.error.issues } },
        { status: 400 },
      );
    }

    const msg = await sendMessage(offerId, user.id, validation.data.body, validation.data.imageUrl);
    return NextResponse.json({ data: msg }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Not authorized") ? 403 : 500;
    return NextResponse.json({ error: { code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR", message } }, { status });
  }
}
