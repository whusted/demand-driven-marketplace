import { describe, it, expect } from "vitest";
import {
  LISTING_STATUS,
  OFFER_STATUS,
  CONDITION,
  OFFER_CONDITION,
  NOTIFICATION_TYPE,
} from "@/types";
import type {
  ListingStatus,
  OfferStatus,
  Condition,
  OfferCondition,
  NotificationType,
  User,
  Listing,
  Offer,
  Message,
  SellerAlert,
  Review,
  Notification,
} from "@/types";

describe("types", () => {
  it("should define all listing statuses", () => {
    expect(LISTING_STATUS).toEqual(["active", "fulfilled", "expired", "closed"]);
  });

  it("should define all offer statuses", () => {
    expect(OFFER_STATUS).toEqual(["pending", "accepted", "declined", "withdrawn"]);
  });

  it("should define all conditions including 'any' for listings", () => {
    expect(CONDITION).toContain("any");
    expect(CONDITION).toContain("mint");
    expect(CONDITION.length).toBe(6);
  });

  it("should define offer conditions without 'any'", () => {
    expect(OFFER_CONDITION).not.toContain("any");
    expect(OFFER_CONDITION.length).toBe(5);
  });

  it("should define all notification types", () => {
    expect(NOTIFICATION_TYPE).toContain("new_offer");
    expect(NOTIFICATION_TYPE).toContain("new_message");
    expect(NOTIFICATION_TYPE).toContain("alert_match");
    expect(NOTIFICATION_TYPE.length).toBe(7);
  });

  it("should allow valid type assignments", () => {
    const status: ListingStatus = "active";
    const offerStatus: OfferStatus = "pending";
    const condition: Condition = "any";
    const offerCondition: OfferCondition = "mint";
    const notifType: NotificationType = "new_offer";

    expect(status).toBe("active");
    expect(offerStatus).toBe("pending");
    expect(condition).toBe("any");
    expect(offerCondition).toBe("mint");
    expect(notifType).toBe("new_offer");
  });
});
