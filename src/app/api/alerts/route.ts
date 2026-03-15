import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/supabase/auth";
import { createAlertSchema } from "@/lib/validators/alerts";
import { createAlert, getMyAlerts } from "@/services/alerts";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const validation = createAlertSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid request", details: validation.error.issues } }, { status: 400 });
    }
    const alert = await createAlert(user.id, validation.data);
    return NextResponse.json({ data: alert }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const alerts = await getMyAlerts(user.id);
    return NextResponse.json({ data: alerts });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
