import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// --- Enums ---

export const listingStatusEnum = pgEnum("listing_status", [
  "active",
  "fulfilled",
  "expired",
  "closed",
]);

export const offerStatusEnum = pgEnum("offer_status", [
  "pending",
  "accepted",
  "declined",
  "withdrawn",
]);

export const conditionEnum = pgEnum("condition", [
  "any",
  "mint",
  "near_mint",
  "good",
  "fair",
  "poor",
]);

export const offerConditionEnum = pgEnum("offer_condition", [
  "mint",
  "near_mint",
  "good",
  "fair",
  "poor",
]);

// --- Tables ---

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  location: text("location"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  ratingCount: integer("rating_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("categories_slug_idx").on(table.slug)],
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull(),
  },
  (table) => [uniqueIndex("tags_slug_idx").on(table.slug)],
);

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    buyerId: uuid("buyer_id")
      .references(() => users.id)
      .notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    categoryId: uuid("category_id").references(() => categories.id),
    condition: conditionEnum("condition").default("any").notNull(),
    maxPrice: integer("max_price"),
    currency: text("currency").default("USD").notNull(),
    location: text("location"),
    shippingOk: boolean("shipping_ok").default(true).notNull(),
    localOnly: boolean("local_only").default(false).notNull(),
    status: listingStatusEnum("status").default("active").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    viewCount: integer("view_count").default(0).notNull(),
    searchVector: text("search_vector"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("listings_buyer_id_idx").on(table.buyerId),
    index("listings_status_idx").on(table.status),
    index("listings_category_id_idx").on(table.categoryId),
    index("listings_created_at_idx").on(table.createdAt),
  ],
);

export const listingImages = pgTable("listing_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id")
    .references(() => listings.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const listingTags = pgTable(
  "listing_tags",
  {
    listingId: uuid("listing_id")
      .references(() => listings.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.listingId, table.tagId] })],
);

export const offers = pgTable(
  "offers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .references(() => listings.id)
      .notNull(),
    sellerId: uuid("seller_id")
      .references(() => users.id)
      .notNull(),
    price: integer("price").notNull(),
    currency: text("currency").default("USD").notNull(),
    condition: offerConditionEnum("condition").notNull(),
    description: text("description").notNull(),
    shippingMethod: text("shipping_method"),
    status: offerStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("offers_listing_id_idx").on(table.listingId),
    index("offers_seller_id_idx").on(table.sellerId),
    index("offers_listing_seller_idx").on(table.listingId, table.sellerId),
  ],
);

export const offerImages = pgTable("offer_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  offerId: uuid("offer_id")
    .references(() => offers.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    offerId: uuid("offer_id")
      .references(() => offers.id)
      .notNull(),
    senderId: uuid("sender_id")
      .references(() => users.id)
      .notNull(),
    body: text("body").notNull(),
    imageUrl: text("image_url"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("messages_offer_id_idx").on(table.offerId),
    index("messages_offer_created_idx").on(table.offerId, table.createdAt),
  ],
);

export const sellerAlerts = pgTable(
  "seller_alerts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    categoryId: uuid("category_id").references(() => categories.id),
    keywords: text("keywords")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("seller_alerts_user_id_idx").on(table.userId)],
);

export const sellerAlertTags = pgTable(
  "seller_alert_tags",
  {
    alertId: uuid("alert_id")
      .references(() => sellerAlerts.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.alertId, table.tagId] })],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reviewerId: uuid("reviewer_id").references(() => users.id),
    revieweeId: uuid("reviewee_id")
      .references(() => users.id)
      .notNull(),
    offerId: uuid("offer_id")
      .references(() => offers.id)
      .notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("reviews_reviewee_id_idx").on(table.revieweeId)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    data: jsonb("data"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_read_idx").on(table.userId, table.readAt),
    index("notifications_user_created_idx").on(table.userId, table.createdAt),
  ],
);
