import { describe, it, expect, vi } from "vitest";

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: "alert-1" }]),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    transaction: vi.fn(),
  },
}));

import { createAlert, getMyAlerts, updateAlert, deleteAlert, matchAlertForListing } from "@/services/alerts";

describe("alerts service", () => {
  it("should export createAlert", () => { expect(typeof createAlert).toBe("function"); });
  it("should export getMyAlerts", () => { expect(typeof getMyAlerts).toBe("function"); });
  it("should export updateAlert", () => { expect(typeof updateAlert).toBe("function"); });
  it("should export deleteAlert", () => { expect(typeof deleteAlert).toBe("function"); });
  it("should export matchAlertForListing", () => { expect(typeof matchAlertForListing).toBe("function"); });
});
