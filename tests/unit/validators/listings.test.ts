import { describe, it, expect } from "vitest";
import { createListingSchema, updateListingSchema } from "@/lib/validators/listings";

describe("createListingSchema", () => {
  const valid = {
    title: "Looking for a vintage guitar pedal",
    description: "I want a Boss DS-1 from the early 80s in good condition",
    condition: "good" as const,
    tags: ["vintage", "guitar"],
  };

  it("should accept valid listing", () => {
    const result = createListingSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("should reject title under 5 chars", () => {
    const result = createListingSchema.safeParse({ ...valid, title: "Hi" });
    expect(result.success).toBe(false);
  });

  it("should reject title over 200 chars", () => {
    const result = createListingSchema.safeParse({ ...valid, title: "x".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("should reject description under 20 chars", () => {
    const result = createListingSchema.safeParse({ ...valid, description: "too short" });
    expect(result.success).toBe(false);
  });

  it("should reject negative max_price", () => {
    const result = createListingSchema.safeParse({ ...valid, maxPrice: -1 });
    expect(result.success).toBe(false);
  });

  it("should accept null max_price (open to offers)", () => {
    const result = createListingSchema.safeParse({ ...valid, maxPrice: null });
    expect(result.success).toBe(true);
  });

  it("should reject more than 5 image_ids", () => {
    const result = createListingSchema.safeParse({
      ...valid,
      imageIds: ["a", "b", "c", "d", "e", "f"],
    });
    expect(result.success).toBe(false);
  });
});

describe("updateListingSchema", () => {
  it("should accept partial updates", () => {
    const result = updateListingSchema.safeParse({ title: "Updated title here" });
    expect(result.success).toBe(true);
  });

  it("should still validate constraints on provided fields", () => {
    const result = updateListingSchema.safeParse({ title: "Hi" });
    expect(result.success).toBe(false);
  });
});
