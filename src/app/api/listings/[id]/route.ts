import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAuthUser, AuthError } from "@/lib/supabase/auth";
import { updateListingSchema } from "@/lib/validators/listings";
import { getListingById, updateListing, closeListing } from "@/services/listings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const listing = await getListingById(id);

    if (!listing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Listing not found" } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: listing });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 },
    );
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

    const validation = updateListingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid request", details: validation.error.issues } },
        { status: 400 },
      );
    }

    const updated = await updateListing(id, validation.data, user.id);
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: error.message } },
        { status: 401 },
      );
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Not authorized") ? 403 : 500;
    return NextResponse.json(
      { error: { code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR", message } },
      { status },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const updated = await closeListing(id, user.id);
    return NextResponse.json({ data: { status: updated.status } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: error.message } },
        { status: 401 },
      );
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Not authorized") ? 403 : 500;
    return NextResponse.json(
      { error: { code: status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR", message } },
      { status },
    );
  }
}
