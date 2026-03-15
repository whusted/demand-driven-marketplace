import { describe, it, expect, vi } from "vitest";

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: "user-1" }]),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

import { getUserProfile, updateProfile } from "@/services/users";
import { createReview, getReviewsForUser } from "@/services/reviews";

describe("users service", () => {
  it("should export getUserProfile", () => { expect(typeof getUserProfile).toBe("function"); });
  it("should export updateProfile", () => { expect(typeof updateProfile).toBe("function"); });
});

describe("reviews service", () => {
  it("should export createReview", () => { expect(typeof createReview).toBe("function"); });
  it("should export getReviewsForUser", () => { expect(typeof getReviewsForUser).toBe("function"); });
});
