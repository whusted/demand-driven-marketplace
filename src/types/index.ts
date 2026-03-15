export const LISTING_STATUS = ["active", "fulfilled", "expired", "closed"] as const;
export type ListingStatus = (typeof LISTING_STATUS)[number];

export const OFFER_STATUS = ["pending", "accepted", "declined", "withdrawn"] as const;
export type OfferStatus = (typeof OFFER_STATUS)[number];

export const CONDITION = ["any", "mint", "near_mint", "good", "fair", "poor"] as const;
export type Condition = (typeof CONDITION)[number];

export const OFFER_CONDITION = ["mint", "near_mint", "good", "fair", "poor"] as const;
export type OfferCondition = (typeof OFFER_CONDITION)[number];

export const NOTIFICATION_TYPE = [
  "new_offer",
  "new_message",
  "offer_accepted",
  "offer_declined",
  "offer_withdrawn",
  "alert_match",
  "new_review",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPE)[number];

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  rating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  categoryId: string | null;
  condition: Condition;
  maxPrice: number | null;
  currency: string;
  location: string | null;
  shippingOk: boolean;
  localOnly: boolean;
  status: ListingStatus;
  expiresAt: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  sortOrder: number;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Offer {
  id: string;
  listingId: string;
  sellerId: string;
  price: number;
  currency: string;
  condition: OfferCondition;
  description: string;
  shippingMethod: string | null;
  status: OfferStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferImage {
  id: string;
  offerId: string;
  url: string;
  sortOrder: number;
  createdAt: Date;
}

export interface Message {
  id: string;
  offerId: string;
  senderId: string;
  body: string;
  imageUrl: string | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface SellerAlert {
  id: string;
  userId: string;
  categoryId: string | null;
  keywords: string[];
  createdAt: Date;
}

export interface Review {
  id: string;
  reviewerId: string | null;
  revieweeId: string;
  offerId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  readAt: Date | null;
  createdAt: Date;
}
