import { describe, it, expect } from "vitest";
import { createReviewSchema } from "@/lib/validators/reviews";

describe("createReviewSchema", () => {
  const valid = {
    offerId: "550e8400-e29b-41d4-a716-446655440000",
    rating: 5,
  };

  it("should accept valid review", () => {
    expect(createReviewSchema.safeParse(valid).success).toBe(true);
  });

  it("should accept review with comment", () => {
    expect(createReviewSchema.safeParse({ ...valid, comment: "Great!" }).success).toBe(true);
  });

  it("should reject rating below 1", () => {
    expect(createReviewSchema.safeParse({ ...valid, rating: 0 }).success).toBe(false);
  });

  it("should reject rating above 5", () => {
    expect(createReviewSchema.safeParse({ ...valid, rating: 6 }).success).toBe(false);
  });

  it("should reject non-integer rating", () => {
    expect(createReviewSchema.safeParse({ ...valid, rating: 3.5 }).success).toBe(false);
  });

  it("should reject comment over 1000 chars", () => {
    expect(
      createReviewSchema.safeParse({ ...valid, comment: "x".repeat(1001) }).success,
    ).toBe(false);
  });
});
