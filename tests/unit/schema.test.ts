import { describe, it, expect } from "vitest";
import { getTableName } from "drizzle-orm";

// Will import from schema once created
import {
  users,
  listings,
  listingImages,
  categories,
  tags,
  listingTags,
  offers,
  offerImages,
  messages,
  sellerAlerts,
  sellerAlertTags,
  reviews,
  notifications,
  listingStatusEnum,
  offerStatusEnum,
  conditionEnum,
  offerConditionEnum,
} from "@/db/schema";

describe("database schema", () => {
  describe("enums", () => {
    it("should define listing status enum with correct values", () => {
      expect(listingStatusEnum.enumValues).toEqual([
        "active",
        "fulfilled",
        "expired",
        "closed",
      ]);
    });

    it("should define offer status enum with correct values", () => {
      expect(offerStatusEnum.enumValues).toEqual([
        "pending",
        "accepted",
        "declined",
        "withdrawn",
      ]);
    });

    it("should define condition enum with 'any' for listings", () => {
      expect(conditionEnum.enumValues).toContain("any");
      expect(conditionEnum.enumValues).toContain("mint");
    });

    it("should define offer condition enum without 'any'", () => {
      expect(offerConditionEnum.enumValues).not.toContain("any");
      expect(offerConditionEnum.enumValues).toContain("mint");
    });
  });

  describe("tables", () => {
    it("should define all 13 tables", () => {
      const tableNames = [
        users,
        listings,
        listingImages,
        categories,
        tags,
        listingTags,
        offers,
        offerImages,
        messages,
        sellerAlerts,
        sellerAlertTags,
        reviews,
        notifications,
      ].map((t) => getTableName(t));

      expect(tableNames).toContain("users");
      expect(tableNames).toContain("listings");
      expect(tableNames).toContain("listing_images");
      expect(tableNames).toContain("categories");
      expect(tableNames).toContain("tags");
      expect(tableNames).toContain("listing_tags");
      expect(tableNames).toContain("offers");
      expect(tableNames).toContain("offer_images");
      expect(tableNames).toContain("messages");
      expect(tableNames).toContain("seller_alerts");
      expect(tableNames).toContain("seller_alert_tags");
      expect(tableNames).toContain("reviews");
      expect(tableNames).toContain("notifications");
      expect(tableNames.length).toBe(13);
    });
  });

  describe("users table", () => {
    it("should have required columns", () => {
      const cols = Object.keys(users);
      expect(cols).toContain("id");
      expect(cols).toContain("email");
      expect(cols).toContain("username");
      expect(cols).toContain("displayName");
      expect(cols).toContain("avatarUrl");
      expect(cols).toContain("bio");
      expect(cols).toContain("location");
      expect(cols).toContain("rating");
      expect(cols).toContain("ratingCount");
      expect(cols).toContain("createdAt");
      expect(cols).toContain("updatedAt");
    });
  });

  describe("listings table", () => {
    it("should have required columns", () => {
      const cols = Object.keys(listings);
      expect(cols).toContain("id");
      expect(cols).toContain("buyerId");
      expect(cols).toContain("title");
      expect(cols).toContain("description");
      expect(cols).toContain("categoryId");
      expect(cols).toContain("condition");
      expect(cols).toContain("maxPrice");
      expect(cols).toContain("currency");
      expect(cols).toContain("location");
      expect(cols).toContain("shippingOk");
      expect(cols).toContain("localOnly");
      expect(cols).toContain("status");
      expect(cols).toContain("expiresAt");
      expect(cols).toContain("viewCount");
      expect(cols).toContain("searchVector");
      expect(cols).toContain("createdAt");
      expect(cols).toContain("updatedAt");
    });
  });

  describe("offers table", () => {
    it("should have required columns", () => {
      const cols = Object.keys(offers);
      expect(cols).toContain("id");
      expect(cols).toContain("listingId");
      expect(cols).toContain("sellerId");
      expect(cols).toContain("price");
      expect(cols).toContain("currency");
      expect(cols).toContain("condition");
      expect(cols).toContain("description");
      expect(cols).toContain("shippingMethod");
      expect(cols).toContain("status");
      expect(cols).toContain("createdAt");
      expect(cols).toContain("updatedAt");
    });
  });

  describe("messages table", () => {
    it("should have required columns", () => {
      const cols = Object.keys(messages);
      expect(cols).toContain("id");
      expect(cols).toContain("offerId");
      expect(cols).toContain("senderId");
      expect(cols).toContain("body");
      expect(cols).toContain("imageUrl");
      expect(cols).toContain("readAt");
      expect(cols).toContain("createdAt");
    });
  });

  describe("reviews table", () => {
    it("should have required columns including nullable reviewerId for anonymization", () => {
      const cols = Object.keys(reviews);
      expect(cols).toContain("id");
      expect(cols).toContain("reviewerId");
      expect(cols).toContain("revieweeId");
      expect(cols).toContain("offerId");
      expect(cols).toContain("rating");
      expect(cols).toContain("comment");
      expect(cols).toContain("createdAt");
    });
  });

  describe("notifications table", () => {
    it("should have required columns including jsonb data field", () => {
      const cols = Object.keys(notifications);
      expect(cols).toContain("id");
      expect(cols).toContain("userId");
      expect(cols).toContain("type");
      expect(cols).toContain("title");
      expect(cols).toContain("body");
      expect(cols).toContain("data");
      expect(cols).toContain("readAt");
      expect(cols).toContain("createdAt");
    });
  });

  describe("junction tables", () => {
    it("listing_tags should have listingId and tagId", () => {
      const cols = Object.keys(listingTags);
      expect(cols).toContain("listingId");
      expect(cols).toContain("tagId");
    });

    it("seller_alert_tags should have alertId and tagId", () => {
      const cols = Object.keys(sellerAlertTags);
      expect(cols).toContain("alertId");
      expect(cols).toContain("tagId");
    });
  });
});
