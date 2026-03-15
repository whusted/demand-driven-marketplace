import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/supabase/auth";
import { getAuthMe } from "@/services/users";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const profile = await getAuthMe(user.id);
    if (!profile) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Profile not found" } }, { status: 404 });
    }
    return NextResponse.json({ data: profile });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
