import { describe, it, expect, vi } from "vitest";

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: "msg-1" }]),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

import { getMessagesForOffer, sendMessage, markMessagesAsRead } from "@/services/messages";

describe("messages service", () => {
  it("should export getMessagesForOffer", () => {
    expect(typeof getMessagesForOffer).toBe("function");
  });

  it("should export sendMessage", () => {
    expect(typeof sendMessage).toBe("function");
  });

  it("should export markMessagesAsRead", () => {
    expect(typeof markMessagesAsRead).toBe("function");
  });
});
