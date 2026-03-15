import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/supabase/auth";
import { updateAlertSchema } from "@/lib/validators/alerts";
import { updateAlert, deleteAlert } from "@/services/alerts";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const validation = updateAlertSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid request" } }, { status: 400 });
    }
    const updated = await updateAlert(id, user.id, validation.data);
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Not authorized") ? 403 : 500;
    return NextResponse.json({ error: { code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR", message } }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    await deleteAlert(id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Not authorized") ? 403 : 500;
    return NextResponse.json({ error: { code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR", message } }, { status });
  }
}
