import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/supabase/auth";
import { createReviewSchema } from "@/lib/validators/reviews";
import { createReview } from "@/services/reviews";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const validation = createReviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid request", details: validation.error.issues } }, { status: 400 });
    }
    const review = await createReview(user.id, validation.data);
    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message.includes("already reviewed")) {
      return NextResponse.json({ error: { code: "CONFLICT", message } }, { status: 409 });
    }
    const status = message.includes("Not authorized") ? 403 : 500;
    return NextResponse.json({ error: { code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR", message } }, { status });
  }
}
