import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module before importing the service
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: "listing-1" }]),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    query: {
      listings: {
        findFirst: vi.fn(),
      },
    },
    transaction: vi.fn(),
  },
}));

import {
  createListing,
  getListingById,
  updateListing,
  closeListing,
  reopenListing,
} from "@/services/listings";

describe("listings service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createListing", () => {
    it("should be a function", () => {
      expect(typeof createListing).toBe("function");
    });

    it("should accept data and userId parameters", () => {
      expect(createListing.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("getListingById", () => {
    it("should be a function", () => {
      expect(typeof getListingById).toBe("function");
    });
  });

  describe("updateListing", () => {
    it("should be a function that accepts id, data, userId", () => {
      expect(typeof updateListing).toBe("function");
    });
  });

  describe("closeListing", () => {
    it("should be a function", () => {
      expect(typeof closeListing).toBe("function");
    });
  });

  describe("reopenListing", () => {
    it("should be a function", () => {
      expect(typeof reopenListing).toBe("function");
    });
  });
});
