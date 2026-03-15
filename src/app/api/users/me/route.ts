import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/supabase/auth";
import { updateProfileSchema } from "@/lib/validators/users";
import { updateProfile } from "@/services/users";

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid request", details: validation.error.issues } }, { status: 400 });
    }
    const updated = await updateProfile(user.id, validation.data);
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
