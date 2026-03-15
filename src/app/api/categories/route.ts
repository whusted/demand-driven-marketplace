import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.name));

    // Build hierarchical tree
    const topLevel = allCategories.filter((c) => !c.parentId);
    const tree = topLevel.map((parent) => ({
      ...parent,
      children: allCategories.filter((c) => c.parentId === parent.id),
    }));

    return NextResponse.json({ data: tree });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch categories" } },
      { status: 500 },
    );
  }
}
