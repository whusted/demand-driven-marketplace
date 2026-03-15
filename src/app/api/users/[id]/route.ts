import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/services/users";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const profile = await getUserProfile(id);
    if (!profile) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });
    }
    return NextResponse.json({ data: profile });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
