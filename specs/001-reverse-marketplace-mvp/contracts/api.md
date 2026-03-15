# API Contracts: Reverse Marketplace MVP

**Branch**: `001-reverse-marketplace-mvp` | **Date**: 2026-03-15

All endpoints are JSON over HTTPS. Authentication via Supabase Auth JWT in `Authorization: Bearer <token>` header. Dates in ISO 8601. Prices in cents (integer). Paginated endpoints accept `?page=1&limit=20` (default limit 20, max 100).

## Standard Response Envelope

```json
// Success
{ "data": <payload>, "meta": { "page": 1, "limit": 20, "total": 142 } }

// Error
{ "error": { "code": "VALIDATION_ERROR", "message": "Human-readable message", "details": [...] } }
```

## Auth

### POST /api/auth/register
Create account (handled primarily by Supabase Auth client-side SDK).

### POST /api/auth/login
Login (handled primarily by Supabase Auth client-side SDK).

### GET /api/auth/me
Returns the current authenticated user's profile.

**Response 200**:
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "collector42",
    "display_name": "Jane Doe",
    "avatar_url": "https://...",
    "bio": "Vintage vinyl collector",
    "location": "Minneapolis, MN",
    "rating": 4.75,
    "rating_count": 12,
    "created_at": "2026-03-15T..."
  }
}
```

---

## Listings

### POST /api/listings
Create a wanted listing. **Auth required.**

**Request body**:
```json
{
  "title": "1985 Prince Purple Rain tour shirt, size L",
  "description": "Looking for mint condition...",
  "category_id": "uuid | null",
  "condition": "mint | near_mint | good | fair | poor | any",
  "max_price": 50000,
  "currency": "USD",
  "location": "Minneapolis, MN",
  "shipping_ok": true,
  "local_only": false,
  "expires_at": "2026-06-15T00:00:00Z | null",
  "image_ids": ["uuid", "uuid"],
  "tags": ["vintage", "concert tee", "Prince"]
}
```

**Response 201**: Created listing object.

### GET /api/listings
Search and browse listings.

**Query params**:
| Param | Type | Description |
|-------|------|-------------|
| q | string | Full-text search query |
| category | string | Category slug |
| tags | string | Comma-separated tag slugs |
| condition | string | Condition filter |
| min_price | integer | Min max_price (cents) |
| max_price | integer | Max max_price (cents) |
| location | string | Location text match |
| local_only | boolean | Filter local-only listings |
| status | string | DEFAULT 'active' |
| sort | string | 'relevance' (default when q present), 'newest', 'price_asc', 'price_desc' |
| page | integer | DEFAULT 1 |
| limit | integer | DEFAULT 20, max 100 |

**Response 200**: Paginated array of listing summaries (no full description, truncated to 200 chars).

### GET /api/listings/:id
Get full listing detail. Increments view_count.

**Response 200**: Full listing object with images, tags, category, buyer profile summary.

### PATCH /api/listings/:id
Update listing. **Auth required. Must be buyer.**

**Request body**: Partial listing fields (same shape as POST, all optional).

**Response 200**: Updated listing object.

### DELETE /api/listings/:id
Close a listing (sets status to 'closed'). **Auth required. Must be buyer.**

**Response 200**: `{ "data": { "status": "closed" } }`

### POST /api/listings/:id/reopen
Reopen a fulfilled/closed/expired listing back to active. **Auth required. Must be buyer.**

**Response 200**: Updated listing with status 'active'.

---

## Offers

### POST /api/listings/:id/offers
Submit an offer on a listing. **Auth required. Cannot be listing buyer.**

**Request body**:
```json
{
  "price": 45000,
  "currency": "USD",
  "condition": "near_mint",
  "description": "I have this shirt from the original tour...",
  "shipping_method": "USPS Priority Mail, insured",
  "image_ids": ["uuid"]
}
```

**Response 201**: Created offer object.
**Error 403**: Cannot offer on own listing.

### GET /api/listings/:id/offers
Get all offers on a listing. **Auth required. Must be listing buyer.**

**Response 200**: Paginated array of offers with seller profile summary and images.

### GET /api/offers/:id
Get offer detail. **Auth required. Must be buyer or seller of this offer.**

**Response 200**: Full offer with images, seller profile, listing summary.

### PATCH /api/offers/:id
Update offer details. **Auth required. Must be seller. Only while status is 'pending'.**

**Request body**: Partial offer fields (price, description, condition, shipping_method, image_ids).

**Response 200**: Updated offer.

### POST /api/offers/:id/accept
Accept an offer. **Auth required. Must be listing buyer.** Sets offer status to 'accepted' and listing status to 'fulfilled'.

**Response 200**: Updated offer with status 'accepted'.

### POST /api/offers/:id/decline
Decline an offer. **Auth required. Must be listing buyer.**

**Response 200**: Updated offer with status 'declined'.

### DELETE /api/offers/:id
Withdraw an offer. **Auth required. Must be seller. Only while status is 'pending'.**

**Response 200**: `{ "data": { "status": "withdrawn" } }`

### GET /api/users/me/offers
Get current user's submitted offers (as seller). **Auth required.**

**Query params**: status (filter), page, limit.

**Response 200**: Paginated array of offers with listing summary.

---

## Messages

### GET /api/offers/:id/messages
Get message thread for an offer. **Auth required. Must be buyer or seller of this offer.**

**Query params**: page, limit (default 50), before (cursor-based: messages before this timestamp).

**Response 200**: Array of messages, newest last.

### POST /api/offers/:id/messages
Send a message. **Auth required. Must be buyer or seller of this offer.**

**Request body**:
```json
{
  "body": "Can you send a closer photo of the tag?",
  "image_url": "https://... | null"
}
```

**Response 201**: Created message.

---

## Notifications

### GET /api/notifications
Get current user's notifications. **Auth required.**

**Query params**: unread_only (boolean), page, limit.

**Response 200**: Paginated array of notifications.

### PATCH /api/notifications/:id/read
Mark a notification as read. **Auth required.**

**Response 200**: Updated notification.

### POST /api/notifications/read-all
Mark all notifications as read. **Auth required.**

**Response 200**: `{ "data": { "updated": 15 } }`

---

## Seller Alerts

### POST /api/alerts
Create a seller alert. **Auth required.**

**Request body**:
```json
{
  "category_id": "uuid | null",
  "keywords": ["vintage", "synthesizer"],
  "tags": ["analog", "1980s"]
}
```

**Response 201**: Created alert object.

### GET /api/alerts
Get current user's alerts. **Auth required.**

**Response 200**: Array of alerts with category and tag details.

### PATCH /api/alerts/:id
Update an alert. **Auth required. Must be owner.**

**Response 200**: Updated alert.

### DELETE /api/alerts/:id
Delete an alert. **Auth required. Must be owner.**

**Response 204**: No content.

---

## Users & Reviews

### GET /api/users/:id
Get public profile.

**Response 200**: User profile with rating, recent listings (last 5), recent reviews (last 5).

### PATCH /api/users/me
Update own profile. **Auth required.**

**Request body**: Partial user fields (display_name, bio, avatar_url, location).

**Response 200**: Updated user.

### POST /api/reviews
Leave a review. **Auth required. Offer must be accepted. One review per user per offer.**

**Request body**:
```json
{
  "offer_id": "uuid",
  "rating": 5,
  "comment": "Excellent condition, fast shipping!"
}
```

**Response 201**: Created review. Reviewee's rating/rating_count updated.
**Error 409**: Review already exists for this user on this offer.

### GET /api/users/:id/reviews
Get reviews for a user.

**Query params**: page, limit.

**Response 200**: Paginated array of reviews with reviewer summary (or "Deleted User").

---

## Upload

### POST /api/upload
Get a signed upload URL for Supabase Storage. **Auth required.**

**Request body**:
```json
{
  "filename": "photo.jpg",
  "content_type": "image/jpeg",
  "size": 2048576
}
```

**Validation**: content_type must be image/jpeg, image/png, or image/webp. size <= 10MB.

**Response 200**:
```json
{
  "data": {
    "upload_url": "https://supabase.co/storage/...",
    "image_id": "uuid",
    "public_url": "https://cdn.supabase.co/..."
  }
}
```
