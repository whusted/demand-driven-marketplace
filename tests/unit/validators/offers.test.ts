import { describe, it, expect } from "vitest";
import { createOfferSchema } from "@/lib/validators/offers";

describe("createOfferSchema", () => {
  const valid = {
    price: 5000,
    condition: "good" as const,
    description: "I have this item in great shape, barely used",
    imageIds: ["img-1"],
  };

  it("should accept valid offer", () => {
    const result = createOfferSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("should reject price <= 0", () => {
    expect(createOfferSchema.safeParse({ ...valid, price: 0 }).success).toBe(false);
    expect(createOfferSchema.safeParse({ ...valid, price: -1 }).success).toBe(false);
  });

  it("should reject description under 10 chars", () => {
    const result = createOfferSchema.safeParse({ ...valid, description: "short" });
    expect(result.success).toBe(false);
  });

  it("should require at least 1 image", () => {
    const result = createOfferSchema.safeParse({ ...valid, imageIds: [] });
    expect(result.success).toBe(false);
  });

  it("should reject more than 10 images", () => {
    const ids = Array.from({ length: 11 }, (_, i) => `img-${i}`);
    const result = createOfferSchema.safeParse({ ...valid, imageIds: ids });
    expect(result.success).toBe(false);
  });
});
