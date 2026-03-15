import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/supabase/auth";
import { uploadRequestSchema } from "@/lib/validators/upload";
import { getSignedUploadUrl } from "@/services/upload";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const validation = uploadRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid request", details: validation.error.issues } },
        { status: 400 },
      );
    }

    const { filename, contentType, size } = validation.data;
    const result = await getSignedUploadUrl(filename, contentType, size, user.id);

    return NextResponse.json({ data: result });
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
