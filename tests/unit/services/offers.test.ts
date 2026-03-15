import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: "offer-1" }]),
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
    transaction: vi.fn(),
  },
}));

import {
  createOffer,
  getOffersForListing,
  getOfferById,
  acceptOffer,
  declineOffer,
  withdrawOffer,
  getMyOffers,
} from "@/services/offers";

describe("offers service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("exports", () => {
    it("should export createOffer", () => {
      expect(typeof createOffer).toBe("function");
    });

    it("should export getOffersForListing", () => {
      expect(typeof getOffersForListing).toBe("function");
    });

    it("should export getOfferById", () => {
      expect(typeof getOfferById).toBe("function");
    });

    it("should export acceptOffer", () => {
      expect(typeof acceptOffer).toBe("function");
    });

    it("should export declineOffer", () => {
      expect(typeof declineOffer).toBe("function");
    });

    it("should export withdrawOffer", () => {
      expect(typeof withdrawOffer).toBe("function");
    });

    it("should export getMyOffers", () => {
      expect(typeof getMyOffers).toBe("function");
    });
  });
});
