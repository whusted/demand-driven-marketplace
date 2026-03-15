import { describe, it, expect, vi } from "vitest";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
  },
}));

import { searchListings } from "@/services/search";

describe("search service", () => {
  it("should export searchListings function", () => {
    expect(typeof searchListings).toBe("function");
  });

  it("should accept search params object", () => {
    // Verify it accepts the expected parameter shape
    expect(searchListings.length).toBeGreaterThanOrEqual(1);
  });
});
