# Data Model: Reverse Marketplace MVP

**Branch**: `001-reverse-marketplace-mvp` | **Date**: 2026-03-15

## Entity Relationship Overview

```
User ──1:N──> Listing (as buyer)
User ──1:N──> Offer (as seller)
User ──1:N──> SellerAlert
User ──1:N──> Notification
User ──1:N──> Review (as reviewer)
User ──1:N──> Review (as reviewee)

Listing ──1:N──> Offer
Listing ──N:1──> Category
Listing ──M:N──> Tag (via listing_tags)
Listing ──1:N──> ListingImage

Offer ──1:N──> Message
Offer ──1:N──> OfferImage
Offer ──0:N──> Review (one per participant, max 2)

Category ──1:N──> Category (self-referential, parent-child)

SellerAlert ──N:1──> Category (optional)
SellerAlert ──M:N──> Tag (via seller_alert_tags)
```

## Entities

### User

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| email | text | UNIQUE, NOT NULL | Login credential |
| username | text | UNIQUE, NOT NULL | Public identifier |
| display_name | text | | Shown on profile/listings |
| avatar_url | text | | Supabase Storage URL |
| bio | text | | Max 500 chars |
| location | text | | Free-text city/region |
| rating | numeric(3,2) | DEFAULT 0 | Computed average of reviews |
| rating_count | integer | DEFAULT 0 | Total reviews received |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Validation**: Email must be valid format. Username 3-30 chars, alphanumeric + underscores only. Bio max 500 chars.

### Listing (Wanted Listing)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| buyer_id | uuid | FK → users(id), NOT NULL | Creator |
| title | text | NOT NULL | Max 200 chars |
| description | text | NOT NULL | Max 5000 chars |
| category_id | uuid | FK → categories(id) | Optional |
| condition | enum | 'any','mint','near_mint','good','fair','poor' | DEFAULT 'any' |
| max_price | integer | | Cents. NULL = open to offers |
| currency | text | DEFAULT 'USD' | ISO 4217 |
| location | text | | Buyer's location for meetup |
| shipping_ok | boolean | DEFAULT true | Accepts shipping |
| local_only | boolean | DEFAULT false | Local pickup only |
| status | enum | 'active','fulfilled','expired','closed' | DEFAULT 'active' |
| expires_at | timestamptz | | Optional expiration |
| view_count | integer | DEFAULT 0 | |
| search_vector | tsvector | GENERATED | For full-text search |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**State transitions**:
- `active` → `fulfilled` (buyer accepts an offer)
- `active` → `expired` (past expires_at date)
- `active` → `closed` (buyer manually closes)
- `fulfilled` → `active` (buyer reopens — transaction fell through; previously declined offers stay declined)
- `expired` → `active` (buyer renews/extends)
- `closed` → `active` (buyer reopens)

**Validation**: Title 5-200 chars. Description 20-5000 chars. max_price >= 0 if set.

### ListingImage

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK | |
| listing_id | uuid | FK → listings(id) ON DELETE CASCADE | |
| url | text | NOT NULL | Supabase Storage URL |
| sort_order | integer | DEFAULT 0 | Display ordering |
| created_at | timestamptz | DEFAULT now() | |

**Validation**: Max 5 images per listing. File types: JPEG, PNG, WebP. Max 10MB per image.

### Category

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK | |
| name | text | NOT NULL | Display name |
| slug | text | UNIQUE, NOT NULL | URL-safe identifier |
| parent_id | uuid | FK → categories(id) | NULL = top-level |
| created_at | timestamptz | DEFAULT now() | |

**Validation**: Name 2-100 chars. Slug auto-generated from name. Max 3 levels deep.

### Tag

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK | |
| name | text | UNIQUE, NOT NULL | Display name |
| slug | text | UNIQUE, NOT NULL | URL-safe, lowercase |

**Validation**: Name 2-50 chars. Auto-lowercased. No special characters except hyphens.

### ListingTag (junction)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| listing_id | uuid | FK → listings(id) ON DELETE CASCADE | |
| tag_id | uuid | FK → tags(id) ON DELETE CASCADE | |
| | | PK (listing_id, tag_id) | Composite key |

### Offer

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| listing_id | uuid | FK → listings(id), NOT NULL | |
| seller_id | uuid | FK → users(id), NOT NULL | |
| price | integer | NOT NULL | Cents |
| currency | text | DEFAULT 'USD' | |
| condition | enum | 'mint','near_mint','good','fair','poor' | NOT NULL |
| description | text | NOT NULL | Max 2000 chars |
| shipping_method | text | | Free-text shipping details |
| status | enum | 'pending','accepted','declined','withdrawn' | DEFAULT 'pending' |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**State transitions**:
- `pending` → `accepted` (buyer accepts)
- `pending` → `declined` (buyer declines)
- `pending` → `withdrawn` (seller withdraws)

**Constraints**: A seller CAN submit multiple offers on the same listing. seller_id != listing.buyer_id (no self-offers). Offers visible only to buyer and submitting seller.

**Validation**: Price > 0. Description 10-2000 chars. At least one OfferImage required.

### OfferImage

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK | |
| offer_id | uuid | FK → offers(id) ON DELETE CASCADE | |
| url | text | NOT NULL | |
| sort_order | integer | DEFAULT 0 | |
| created_at | timestamptz | DEFAULT now() | |

**Validation**: Min 1, max 10 images per offer. Same file constraints as ListingImage.

### Message

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| offer_id | uuid | FK → offers(id), NOT NULL | Thread scope |
| sender_id | uuid | FK → users(id), NOT NULL | |
| body | text | NOT NULL | Max 2000 chars |
| image_url | text | | Optional inline image |
| read_at | timestamptz | | NULL = unread |
| created_at | timestamptz | DEFAULT now() | |

**Constraints**: sender_id must be either the offer's seller_id or the listing's buyer_id (only transaction participants can message).

**Validation**: Body 1-2000 chars. Image same constraints as other uploads.

### SellerAlert

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK | |
| user_id | uuid | FK → users(id), NOT NULL | |
| category_id | uuid | FK → categories(id) | Optional filter |
| keywords | text[] | | Array of search terms |
| created_at | timestamptz | DEFAULT now() | |

**Validation**: At least one of category_id, keywords, or tags must be set. Max 20 alerts per user. Keywords max 10 terms per alert.

### SellerAlertTag (junction)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| alert_id | uuid | FK → seller_alerts(id) ON DELETE CASCADE | |
| tag_id | uuid | FK → tags(id) ON DELETE CASCADE | |
| | | PK (alert_id, tag_id) | Composite key |

### Review

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK | |
| reviewer_id | uuid | FK → users(id) | NULL if reviewer deleted account |
| reviewee_id | uuid | FK → users(id), NOT NULL | |
| offer_id | uuid | FK → offers(id), NOT NULL | Must be accepted offer |
| rating | integer | CHECK 1-5, NOT NULL | |
| comment | text | | Max 1000 chars |
| created_at | timestamptz | DEFAULT now() | |

**Constraints**: One review per reviewer per offer. Only buyer/seller of the accepted offer can leave reviews. On reviewer account deletion, reviewer_id set to NULL and display shows "Deleted User" — reviewee's rating is preserved.

**Validation**: Rating 1-5 integer. Comment max 1000 chars.

### Notification

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK | |
| user_id | uuid | FK → users(id), NOT NULL | Recipient |
| type | text | NOT NULL | 'new_offer','new_message','offer_accepted','offer_declined','offer_withdrawn','alert_match','new_review' |
| title | text | NOT NULL | Display title |
| body | text | | Optional detail text |
| data | jsonb | | Flexible payload: listing_id, offer_id, etc. |
| read_at | timestamptz | | NULL = unread |
| created_at | timestamptz | DEFAULT now() | |

## Indexes

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| listings | buyer_id | btree | My listings |
| listings | status | btree | Filter active listings |
| listings | category_id | btree | Category browse |
| listings | search_vector | GIN | Full-text search |
| listings | created_at DESC | btree | Sort by newest |
| offers | listing_id | btree | Offers on a listing |
| offers | seller_id | btree | My offers |
| offers | (listing_id, seller_id) | btree | Lookup seller's offers on listing |
| messages | offer_id | btree | Message thread |
| messages | (offer_id, created_at) | btree | Ordered thread |
| notifications | (user_id, read_at) | btree | Unread notifications |
| notifications | (user_id, created_at DESC) | btree | Notification feed |
| seller_alerts | user_id | btree | My alerts |
| tags | slug | btree (unique) | Tag lookup |
| categories | slug | btree (unique) | Category lookup |
| reviews | reviewee_id | btree | User's reviews |
