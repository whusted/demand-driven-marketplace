import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/supabase/auth";
import { getOfferById, withdrawOffer } from "@/services/offers";
import { updateOfferSchema } from "@/lib/validators/offers";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const offer = await getOfferById(id, user.id);

    if (!offer) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Offer not found" } }, { status: 404 });
    }

    return NextResponse.json({ data: offer });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Not authorized") ? 403 : 500;
    return NextResponse.json({ error: { code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR", message } }, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();

    const validation = updateOfferSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid request", details: validation.error.issues } },
        { status: 400 },
      );
    }

    const [existing] = await db.select().from(offers).where(eq(offers.id, id));
    if (!existing) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Offer not found" } }, { status: 404 });
    }
    if (existing.sellerId !== user.id) {
      return NextResponse.json({ error: { code: "FORBIDDEN", message: "Not authorized" } }, { status: 403 });
    }
    if (existing.status !== "pending") {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Can only edit pending offers" } }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (validation.data.price !== undefined) updateData.price = validation.data.price;
    if (validation.data.description !== undefined) updateData.description = validation.data.description;
    if (validation.data.condition !== undefined) updateData.condition = validation.data.condition;
    if (validation.data.shippingMethod !== undefined) updateData.shippingMethod = validation.data.shippingMethod;

    const [updated] = await db.update(offers).set(updateData).where(eq(offers.id, id)).returning();
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const updated = await withdrawOffer(id, user.id);
    return NextResponse.json({ data: { status: updated.status } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Not authorized") ? 403 : message.includes("pending") ? 400 : 500;
    return NextResponse.json({ error: { code: status === 403 ? "FORBIDDEN" : status === 400 ? "BAD_REQUEST" : "INTERNAL_ERROR", message } }, { status });
  }
}
