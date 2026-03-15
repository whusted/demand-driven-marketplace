# Tasks: Reverse Marketplace MVP

**Input**: Design documents from `/specs/001-reverse-marketplace-mvp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize the Next.js project, install dependencies, configure tooling

- [ ] T001 Initialize Next.js 15 project with App Router and TypeScript strict mode; configure `tsconfig.json`, `next.config.ts`, and `package.json` with all scripts from quickstart.md (`dev`, `build`, `test`, `test:e2e`, `db:migrate`, `db:generate`, `db:seed`, `db:studio`)
- [ ] T002 Install all dependencies: `drizzle-orm`, `drizzle-kit`, `@supabase/supabase-js`, `@supabase/ssr`, `@tanstack/react-query`, `zod`, `resend`, tailwind css 4, `shadcn/ui` init, `vitest`, `@playwright/test`
- [ ] T003 [P] Create `.env.example` with all environment variables from quickstart.md (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, RESEND_API_KEY, NEXT_PUBLIC_APP_URL)
- [ ] T004 [P] Configure Tailwind CSS 4 in `src/app/globals.css` and initialize shadcn/ui with `components.json`; install base primitives (Button, Input, Card, Dialog, Badge, Avatar, DropdownMenu, Tabs, Toast, Tooltip) into `src/components/ui/`
- [ ] T005 [P] Initialize Supabase local project with `supabase/config.toml`
- [ ] T006 [P] Create shared TypeScript types file at `src/types/index.ts` defining enums and types for ListingStatus, OfferStatus, Condition, NotificationType, and all entity interfaces matching data-model.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, auth, Supabase clients, shared utilities -- MUST complete before any user story

- [ ] T007 Define complete Drizzle ORM schema in `src/db/schema.ts` with all tables: users, listings, listing_images, categories, tags, listing_tags, offers, offer_images, messages, seller_alerts, seller_alert_tags, reviews, notifications. Include all enums (listing_status, offer_status, condition), constraints, foreign keys, default values, and the `search_vector` generated tsvector column on listings
- [ ] T008 Generate and apply initial Drizzle migration to `src/db/migrations/`; verify tables and indexes (GIN index on search_vector, btree indexes per data-model.md) are created correctly
- [ ] T009 [P] Create database client module at `src/db/index.ts` that exports a Drizzle client connected via `DATABASE_URL`
- [ ] T010 [P] Create Supabase server client helper at `src/lib/supabase/server.ts` using `@supabase/ssr` with cookie-based session handling for Next.js App Router server components and route handlers
- [ ] T011 [P] Create Supabase browser client helper at `src/lib/supabase/client.ts` using `@supabase/ssr` for client components
- [ ] T012 [P] Create shared constants at `src/lib/constants.ts` (max image size 10MB, max images per listing 5, max images per offer 10, max bio length 500, pagination defaults, allowed image MIME types)
- [ ] T013 [P] Create utility functions at `src/lib/utils.ts` (cn classname merger, formatPrice cents-to-dollars, formatDate, slugify for tags/categories, truncateText)
- [ ] T014 Create Zod validation schemas at `src/lib/validators/listings.ts` for createListing and updateListing request bodies matching API contract fields and data-model constraints (title 5-200 chars, description 20-5000 chars, max_price >= 0, max 5 image_ids, tags array)
- [ ] T015 [P] Create Zod validation schemas at `src/lib/validators/offers.ts` for createOffer and updateOffer (price > 0, description 10-2000 chars, condition required, at least 1 image_id)
- [ ] T016 [P] Create Zod validation schemas at `src/lib/validators/users.ts` for updateProfile (display_name, bio max 500, avatar_url, location) and registerUser (email, username 3-30 alphanumeric+underscores, password)
- [ ] T017 [P] Create Zod validation schemas at `src/lib/validators/messages.ts` for createMessage (body 1-2000 chars, optional image_url)
- [ ] T018 [P] Create Zod validation schemas at `src/lib/validators/alerts.ts` for createAlert and updateAlert (optional category_id, keywords array max 10 terms, tags array; at least one must be set)
- [ ] T019 [P] Create Zod validation schemas at `src/lib/validators/reviews.ts` for createReview (offer_id required, rating 1-5 integer, comment max 1000 chars)
- [ ] T020 [P] Create Zod validation schema at `src/lib/validators/upload.ts` for upload request (filename, content_type must be image/jpeg|png|webp, size <= 10MB)
- [ ] T021 Implement auth middleware helper at `src/lib/supabase/auth.ts` that extracts and validates the Supabase JWT from request headers, returns the authenticated user or throws 401; export `getAuthUser(request)` for use in API route handlers
- [ ] T022 Create root layout at `src/app/layout.tsx` with TanStack QueryClientProvider, Supabase auth session provider, global styles, and metadata
- [ ] T023 [P] Create auth layout at `src/app/(auth)/layout.tsx` (centered card layout for login/register, redirects authenticated users to /listings)
- [ ] T024 [P] Create main authenticated layout at `src/app/(main)/layout.tsx` with navigation header (logo, search bar, links to Listings, My Offers, Alerts, Messages, Notifications, Profile), notification badge, and user avatar dropdown; redirect unauthenticated users to /login
- [ ] T025 [P] Create `src/components/layout/header.tsx` -- top navigation bar component with site logo, search input, nav links, notification bell with unread count badge, and user avatar dropdown menu (Profile, Settings, Logout)
- [ ] T026 [P] Create `src/components/layout/footer.tsx` -- simple footer component
- [ ] T027 Create login page at `src/app/(auth)/login/page.tsx` with email/password form and Google OAuth button using Supabase Auth client; redirect to /listings on success
- [ ] T028 Create register page at `src/app/(auth)/register/page.tsx` with email, username, password form and Google OAuth button using Supabase Auth client; create user profile row on success; redirect to /listings
- [ ] T029 Seed initial categories into `supabase/seed.sql` with a hierarchical category tree (top-level: Clothing, Electronics, Music, Toys & Games, Sports, Art, Books, Automotive; each with 2-3 subcategories matching the collectibles domain)
- [ ] T030 Implement image upload service at `src/services/upload.ts` -- function `getSignedUploadUrl(filename, contentType, size, userId)` that validates file metadata, creates a signed upload URL via Supabase Storage, and returns `{ upload_url, image_id, public_url }`
- [ ] T031 Create upload API route at `src/app/api/upload/route.ts` -- POST handler that validates request with upload Zod schema, calls upload service, returns signed URL response per API contract

**Checkpoint**: Foundation ready -- database, auth, clients, validation, layout, and upload all functional

---

## Phase 3: User Story 1 -- Buyer Creates a Wanted Listing (Priority: P1)

**Goal**: Buyers can create, edit, and manage wanted listings with photos, tags, categories, and pricing

**Independent Test**: Create an account, post a wanted listing with all fields, see it appear in the listings browse page

### Implementation

- [ ] T032 Implement listings service at `src/services/listings.ts` -- functions: `createListing(data, userId)` (inserts listing, associates images via listing_images, creates/finds tags and inserts listing_tags, updates search_vector), `getListingById(id)` (joins images, tags, category, buyer profile), `updateListing(id, data, userId)` (partial update with ownership check, preserves existing offers), `closeListing(id, userId)` (sets status to closed), `reopenListing(id, userId)` (sets status back to active)
- [ ] T033 Create listings API routes at `src/app/api/listings/route.ts` -- POST handler (auth required, validates with createListing Zod schema, calls createListing service, returns 201) and GET handler (public, accepts query params q/category/tags/condition/min_price/max_price/location/local_only/status/sort/page/limit, returns paginated listing summaries)
- [ ] T034 Create single listing API routes at `src/app/api/listings/[id]/route.ts` -- GET handler (public, increments view_count, returns full listing with images/tags/category/buyer), PATCH handler (auth required, must be buyer, validates with updateListing schema, returns updated listing), DELETE handler (auth required, must be buyer, calls closeListing, returns status closed)
- [ ] T035 Create listing reopen API route at `src/app/api/listings/[id]/reopen/route.ts` -- POST handler (auth required, must be buyer, calls reopenListing, returns updated listing with status active)
- [ ] T036 [P] [US1] Create listing card component at `src/components/listings/listing-card.tsx` -- displays listing thumbnail, title, truncated description, max price (or "Open to offers"), condition badge, location, tags, and time since posted; links to listing detail page
- [ ] T037 [P] [US1] Create listing form component at `src/components/listings/listing-form.tsx` -- form with fields: title, description (textarea), category (hierarchical dropdown), condition (select), max price (currency input, optional), location, shipping_ok/local_only checkboxes, expiration date (optional date picker), image upload (drag-and-drop, up to 5, shows previews), tags (combobox with existing tag autocomplete + create new); uses Zod schema for client-side validation; handles both create and edit modes
- [ ] T038 [P] [US1] Create image upload component at `src/components/listings/image-upload.tsx` -- drag-and-drop zone that requests signed URL from /api/upload, uploads directly to Supabase Storage, shows upload progress and preview thumbnails, enforces max count and file size limits, returns array of image_ids
- [ ] T039 [P] [US1] Create tag input component at `src/components/listings/tag-input.tsx` -- combobox that searches existing tags via API, allows creating new tags inline, displays selected tags as removable badges
- [ ] T040 [US1] Create new listing page at `src/app/(main)/listings/new/page.tsx` -- renders listing-form in create mode, on submit calls POST /api/listings, redirects to the new listing detail page on success, shows toast on error
- [ ] T041 [US1] Create listing detail page at `src/app/(main)/listings/[id]/page.tsx` -- server component that fetches listing via GET /api/listings/:id, displays full listing with image gallery (carousel), all fields, tags as clickable badges, category breadcrumb, buyer profile summary card with avatar/name/rating; if viewer is the buyer, show edit button and status management (close/reopen); if viewer is another user, show "Make an Offer" button
- [ ] T042 [US1] Create edit listing page at `src/app/(main)/listings/[id]/edit/page.tsx` -- fetches existing listing data, renders listing-form in edit mode pre-filled with current values, on submit calls PATCH /api/listings/:id, redirects back to listing detail on success
- [ ] T043 [US1] Create listings browse/home page at `src/app/(main)/listings/page.tsx` -- displays grid of listing-card components with pagination; this page will be enhanced with search/filter in US3 but initially shows all active listings sorted by newest
- [ ] T044 [US1] Create landing page at `src/app/page.tsx` -- simple hero section explaining the reverse marketplace concept, call-to-action buttons for "Post a Wanted Listing" and "Browse Listings", redirects to /listings or /register as appropriate

**Checkpoint**: Buyers can create, view, edit, close, and reopen wanted listings with photos and tags

---

## Phase 4: User Story 2 -- Seller Browses and Responds with an Offer (Priority: P1)

**Goal**: Sellers can submit offers on wanted listings with photos, price, and condition; buyers can accept, decline, or view offers

**Independent Test**: Seller views a listing, submits an offer with photos and price, buyer sees the offer and can accept/decline

### Implementation

- [ ] T045 Implement offers service at `src/services/offers.ts` -- functions: `createOffer(data, sellerId, listingId)` (validates seller != buyer, listing is active, inserts offer + offer_images), `getOffersForListing(listingId, buyerId)` (returns all offers with seller profiles and images, sorted by newest, verifies requester is buyer), `getOfferById(offerId, userId)` (returns full offer with images/seller/listing, verifies requester is buyer or seller), `acceptOffer(offerId, userId)` (verifies buyer, sets offer to accepted, listing to fulfilled), `declineOffer(offerId, userId)` (verifies buyer, sets offer to declined), `withdrawOffer(offerId, userId)` (verifies seller, only pending, sets to withdrawn), `getMyOffers(userId, filters)` (seller's submitted offers with listing summaries, paginated)
- [ ] T046 Create listing offers API routes at `src/app/api/listings/[id]/offers/route.ts` -- POST handler (auth required, cannot be listing buyer, validates with createOffer schema, returns 201 with offer; returns 403 if self-offer) and GET handler (auth required, must be listing buyer, returns paginated offers)
- [ ] T047 Create single offer API routes at `src/app/api/offers/[id]/route.ts` -- GET handler (auth required, must be buyer or seller, returns full offer), PATCH handler (auth required, must be seller, only pending offers, validates with updateOffer schema), DELETE handler (auth required, must be seller, only pending, withdraws offer)
- [ ] T048 [P] [US2] Create offer accept API route at `src/app/api/offers/[id]/accept/route.ts` -- POST handler (auth required, must be listing buyer, calls acceptOffer service)
- [ ] T049 [P] [US2] Create offer decline API route at `src/app/api/offers/[id]/decline/route.ts` -- POST handler (auth required, must be listing buyer, calls declineOffer service)
- [ ] T050 Create my-offers API route at `src/app/api/users/me/offers/route.ts` -- GET handler (auth required, accepts status filter and pagination, calls getMyOffers service)
- [ ] T051 [P] [US2] Create offer card component at `src/components/offers/offer-card.tsx` -- displays offer photos (thumbnail gallery), asking price (with "exceeds budget" indicator if price > listing max_price), condition badge, description preview, seller name/avatar/rating, status badge (pending/accepted/declined/withdrawn), and action buttons based on viewer role (buyer: accept/decline; seller: withdraw/edit)
- [ ] T052 [P] [US2] Create offer form component at `src/components/offers/offer-form.tsx` -- form with fields: asking price (currency input), condition (select), description (textarea), shipping method (text input), image upload (reuse image-upload component, min 1 max 10 images); uses offer Zod schema for validation; handles create and edit modes
- [ ] T053 [US2] Create offers list page on listing detail at `src/app/(main)/listings/[id]/offers/page.tsx` -- buyer-only view showing all offers on their listing as offer-card components sorted by newest, with status filter tabs (All, Pending, Accepted, Declined); links each offer to its detail view
- [ ] T054 [US2] Create offer detail modal or page section on listing detail -- when buyer clicks an offer-card, expand to show full offer details with all images in gallery, full description, seller profile link, and accept/decline/message action buttons
- [ ] T055 [US2] Create submit offer page at `src/app/(main)/listings/[id]/offers/new/page.tsx` -- renders offer-form, shows the listing summary at top for context, on submit calls POST /api/listings/:id/offers, redirects to listing detail on success with toast confirmation
- [ ] T056 [US2] Create "My Offers" page at `src/app/(main)/offers/page.tsx` -- seller view of all their submitted offers, displays offer-card for each with the associated listing title/thumbnail, filterable by status tabs (All, Pending, Accepted, Declined, Withdrawn), paginated via GET /api/users/me/offers

**Checkpoint**: Full offer lifecycle works -- sellers submit, buyers review/accept/decline, sellers can withdraw

---

## Phase 5: User Story 3 -- Search and Discovery (Priority: P1)

**Goal**: Users can find relevant wanted listings through full-text search, category browsing, and filtering

**Independent Test**: Create several listings with different tags/categories, search with various queries and filters, verify relevant results appear

### Implementation

- [ ] T057 Implement search service at `src/services/search.ts` -- function `searchListings(params)` that builds a Drizzle query with: full-text search using `to_tsquery` against the `search_vector` column with `ts_rank` for relevance scoring, optional filters (category_id via join, tags via listing_tags join, condition, price range on max_price, location ILIKE, local_only, status defaults to active), sorting (relevance when q present, newest, price_asc, price_desc), and pagination (page/limit with total count)
- [ ] T058 [P] [US3] Create categories API route at `src/app/api/categories/route.ts` -- GET handler (public) returning hierarchical category tree for use in browse sidebar and listing form dropdown
- [ ] T059 [P] [US3] Create tags API route at `src/app/api/tags/route.ts` -- GET handler (public) accepting `?q=` for autocomplete search, returns matching tags sorted by usage count
- [ ] T060 [US3] Update listings GET handler in `src/app/api/listings/route.ts` to use the searchListings service instead of a basic query, supporting all query params from the API contract (q, category, tags, condition, min_price, max_price, location, local_only, status, sort, page, limit)
- [ ] T061 [P] [US3] Create search bar component at `src/components/listings/search-bar.tsx` -- text input with search icon, debounced input (300ms), submits query as `?q=` param; can be used in header and on listings page
- [ ] T062 [P] [US3] Create filter sidebar component at `src/components/listings/filter-sidebar.tsx` -- category tree (collapsible), tag multi-select, condition dropdown, price range inputs (min/max), location text input, local-only toggle, sort dropdown; all filters update URL query params for shareable search URLs
- [ ] T063 [US3] Update listings browse page at `src/app/(main)/listings/page.tsx` -- integrate search-bar at top, filter-sidebar on left, listing-card grid on right with pagination; read filters from URL query params, fetch via GET /api/listings with all params, show "No results" message with suggestions when empty, show result count
- [ ] T064 [US3] Update header search bar in `src/components/layout/header.tsx` to navigate to `/listings?q=<query>` on submit, enabling search from any page

**Checkpoint**: Users can search, filter, sort, and browse listings with full-text search and faceted filtering

---

## Phase 6: User Story 4 -- Buyer-Seller Messaging (Priority: P2)

**Goal**: Threaded messaging between buyer and seller on each offer, with real-time delivery and image support

**Independent Test**: Buyer and seller exchange messages on an offer thread, both see conversation in real-time with image attachments

### Implementation

- [ ] T065 Implement messages service at `src/services/messages.ts` -- functions: `getMessagesForOffer(offerId, userId, pagination)` (verifies requester is buyer or seller of the offer, returns messages sorted by created_at ascending, supports cursor-based pagination with `before` param), `sendMessage(offerId, userId, body, imageUrl)` (verifies sender is buyer or seller, inserts message, marks as unread for recipient), `markMessagesAsRead(offerId, userId)` (sets read_at on all unread messages where sender != userId)
- [ ] T066 Create messages API routes at `src/app/api/offers/[id]/messages/route.ts` -- GET handler (auth required, must be buyer or seller, returns paginated messages) and POST handler (auth required, must be buyer or seller, validates with createMessage schema, returns 201)
- [ ] T067 [P] [US4] Create message bubble component at `src/components/messages/message-bubble.tsx` -- displays message body, optional inline image, sender avatar, timestamp, read receipt indicator; left-aligned for other party, right-aligned for current user
- [ ] T068 [P] [US4] Create message input component at `src/components/messages/message-input.tsx` -- text input with send button and image attach button; image attach triggers upload flow (reuse upload service), shows image preview before send
- [ ] T069 [US4] Create conversation thread component at `src/components/messages/conversation-thread.tsx` -- scrollable message list using message-bubble components, auto-scrolls to bottom on new messages, loads older messages on scroll-up (infinite scroll via cursor pagination), integrates Supabase Realtime subscription on `messages` table filtered by `offer_id` for live updates, calls markMessagesAsRead when thread is opened
- [ ] T070 [US4] Create messages page at `src/app/(main)/messages/page.tsx` -- left panel: list of all offer conversations the user is part of (as buyer or seller), showing other party's name/avatar, listing title, last message preview, unread count badge; right panel: conversation-thread component for selected offer; fetch conversations via a dedicated query that aggregates offers with messages for the current user
- [ ] T071 [US4] Add "Message Seller/Buyer" action to offer detail view to navigate to `/messages?offer=<offerId>`, opening that conversation thread directly

**Checkpoint**: Real-time messaging works between buyer and seller on any offer thread

---

## Phase 7: User Story 5 -- Seller Alerts (Priority: P2)

**Goal**: Sellers create alert subscriptions and get notified when matching listings are posted

**Independent Test**: Seller creates an alert for "vintage synthesizer", buyer posts a matching listing, seller receives a notification

### Implementation

- [ ] T072 Implement alerts service at `src/services/alerts.ts` -- functions: `createAlert(userId, data)` (validates at least one criterion set, inserts seller_alert + seller_alert_tags, enforces max 20 alerts per user), `getMyAlerts(userId)` (returns alerts with category and tag details), `updateAlert(alertId, userId, data)` (ownership check, updates criteria), `deleteAlert(alertId, userId)` (ownership check, deletes)
- [ ] T073 Implement alert matching logic in `src/services/alerts.ts` -- function `matchAlertForListing(listingId)` that queries all active seller_alerts, checks: category match (if alert has category_id, listing must match), tag match (if alert has tags, listing must have at least one matching tag), keyword match (if alert has keywords, at least one keyword must appear in listing title/description via ILIKE or tsquery); for each matching alert, create a notification record with type 'alert_match' and data containing listing_id
- [ ] T074 Create alerts API routes at `src/app/api/alerts/route.ts` -- POST handler (auth required, validates with createAlert schema, returns 201) and GET handler (auth required, returns user's alerts)
- [ ] T075 [P] [US5] Create alert update/delete API routes at `src/app/api/alerts/[id]/route.ts` -- PATCH handler (auth required, must be owner, validates with updateAlert schema) and DELETE handler (auth required, must be owner, returns 204)
- [ ] T076 [P] [US5] Create alert card component at `src/components/alerts/alert-card.tsx` -- displays alert criteria (category name, tags as badges, keywords), created date, edit and delete action buttons
- [ ] T077 [P] [US5] Create alert form component at `src/components/alerts/alert-form.tsx` -- form with category dropdown, keywords input (comma-separated or tag-style), tags multi-select (reuse tag-input component); validates at least one criterion; handles create and edit modes
- [ ] T078 [US5] Create seller alerts page at `src/app/(main)/alerts/page.tsx` -- displays list of alert-card components for the current user, "Create New Alert" button that opens alert-form, inline edit via alert-form in edit mode, delete with confirmation dialog
- [ ] T079 [US5] Integrate alert matching into listing creation -- after a new listing is successfully created in `src/services/listings.ts` `createListing`, call `matchAlertForListing(listingId)` to check for and notify matching sellers

**Checkpoint**: Sellers can manage alerts and receive notifications when matching listings are posted

---

## Phase 8: User Story 6 -- User Accounts and Profiles (Priority: P2)

**Goal**: Public user profiles with display name, bio, location, reputation, and reviews

**Independent Test**: Create an account, edit profile, view another user's public profile with reviews and reputation score

### Implementation

- [ ] T080 Implement users service at `src/services/users.ts` -- functions: `getUserProfile(userId)` (public profile with rating, rating_count, recent listings last 5, recent reviews last 5), `updateProfile(userId, data)` (validates and updates display_name, bio, avatar_url, location), `getAuthMe(userId)` (full private profile for authenticated user)
- [ ] T081 Implement reviews service at `src/services/reviews.ts` -- functions: `createReview(reviewerId, data)` (validates offer is accepted, reviewer is buyer or seller of offer, one review per user per offer, inserts review, updates reviewee's rating and rating_count via running average), `getReviewsForUser(userId, pagination)` (returns reviews with reviewer summary, shows "Deleted User" where reviewer_id is NULL)
- [ ] T082 Create user profile API routes at `src/app/api/users/[id]/route.ts` -- GET handler (public, returns user profile via getUserProfile)
- [ ] T083 [P] [US6] Create auth me API route at `src/app/api/auth/me/route.ts` -- GET handler (auth required, returns full private profile)
- [ ] T084 [P] [US6] Create update profile API route at `src/app/api/users/me/route.ts` -- PATCH handler (auth required, validates with updateProfile schema, returns updated user)
- [ ] T085 Create reviews API routes at `src/app/api/reviews/route.ts` -- POST handler (auth required, validates with createReview schema, returns 201; returns 409 if duplicate)
- [ ] T086 [P] [US6] Create user reviews API route at `src/app/api/users/[id]/reviews/route.ts` -- GET handler (public, paginated reviews for a user)
- [ ] T087 [P] [US6] Create profile header component at `src/components/profile/profile-header.tsx` -- displays avatar, display name, username, bio, location, star rating with count, member since date
- [ ] T088 [P] [US6] Create review card component at `src/components/profile/review-card.tsx` -- displays star rating, comment, reviewer name/avatar (or "Deleted User"), listing title reference, date
- [ ] T089 [P] [US6] Create review form component at `src/components/profile/review-form.tsx` -- star rating input (1-5 clickable stars), comment textarea, submit button; shown on accepted offers where current user hasn't left a review yet
- [ ] T090 [US6] Create public profile page at `src/app/(main)/profile/[id]/page.tsx` -- server component that fetches user profile via GET /api/users/:id, displays profile-header, tabs for "Listings" (recent active listings as listing-cards) and "Reviews" (review-card list with pagination)
- [ ] T091 [US6] Create own profile/settings page at `src/app/(main)/profile/page.tsx` -- fetches own profile via GET /api/auth/me, editable form for display_name, bio, avatar (image upload), location; save calls PATCH /api/users/me; shows "My Listings" and "My Reviews" sections below
- [ ] T092 [US6] Integrate review form into offer detail -- when an offer has status 'accepted', show review-form component for both buyer and seller (if they haven't already reviewed)

**Checkpoint**: Users have public profiles with reputation, can leave reviews on completed transactions

---

## Phase 9: User Story 7 -- Notifications Center (Priority: P3)

**Goal**: Centralized in-app notification inbox with real-time updates and email delivery

**Independent Test**: Trigger notification events, verify they appear in the notifications center with correct read/unread status

### Implementation

- [ ] T093 Implement notifications service at `src/services/notifications.ts` -- functions: `createNotification(userId, type, title, body, data)` (inserts notification record), `getNotifications(userId, filters)` (paginated, optional unread_only filter, sorted by newest), `markAsRead(notificationId, userId)` (sets read_at), `markAllAsRead(userId)` (sets read_at on all unread, returns count updated), `getUnreadCount(userId)` (returns integer count for badge)
- [ ] T094 Implement email notification sender at `src/services/notifications.ts` -- function `sendEmailNotification(userId, type, data)` using Resend SDK; define email templates for each notification type (new_offer, new_message, offer_accepted, offer_declined, offer_withdrawn, alert_match, new_review); fetches user email, renders appropriate template, sends via Resend
- [ ] T095 Create notifications API routes at `src/app/api/notifications/route.ts` -- GET handler (auth required, accepts unread_only/page/limit, returns paginated notifications)
- [ ] T096 [P] [US7] Create notification read API route at `src/app/api/notifications/[id]/read/route.ts` -- PATCH handler (auth required, marks single notification as read)
- [ ] T097 [P] [US7] Create mark-all-read API route at `src/app/api/notifications/read-all/route.ts` -- POST handler (auth required, marks all as read, returns count)
- [ ] T098 [P] [US7] Create notification item component at `src/components/notifications/notification-item.tsx` -- displays notification icon (by type), title, body preview, timestamp, unread dot indicator; entire row is clickable to navigate to relevant context (listing, offer, conversation) and mark as read
- [ ] T099 [US7] Create notifications page at `src/app/(main)/notifications/page.tsx` -- list of notification-item components with unread filter toggle, "Mark all as read" button at top, pagination; subscribes to Supabase Realtime on notifications table for live updates
- [ ] T100 [US7] Update header notification bell in `src/components/layout/header.tsx` -- fetch unread count via `getUnreadCount`, display as badge on bell icon, subscribe to Supabase Realtime for live unread count updates, clicking bell navigates to /notifications
- [ ] T101 [US7] Integrate notification creation into all event sources -- update `src/services/offers.ts` (createOffer triggers new_offer notification to buyer; acceptOffer triggers offer_accepted to seller; declineOffer triggers offer_declined to seller; withdrawOffer triggers offer_withdrawn to buyer), update `src/services/messages.ts` (sendMessage triggers new_message to recipient), update `src/services/reviews.ts` (createReview triggers new_review to reviewee); each also calls sendEmailNotification

**Checkpoint**: All platform events generate in-app and email notifications with real-time badge updates

---

## Phase 10: Polish and Cross-Cutting Concerns

**Purpose**: Final refinements affecting multiple user stories

- [ ] T102 [P] Implement listing expiration logic -- create a utility or Edge Function that periodically checks listings with `expires_at` in the past and status 'active', transitions them to 'expired' status, and notifies the buyer; can be a Supabase cron/pg_cron job or a Vercel cron route at `src/app/api/cron/expire-listings/route.ts`
- [ ] T103 [P] Add user reporting endpoint at `src/app/api/reports/route.ts` -- POST handler (auth required) accepting `{ entity_type: 'listing'|'offer'|'user'|'message', entity_id, reason }`, inserts a report record for admin review (create reports table in schema if not present); minimal abuse prevention per spec
- [ ] T104 [P] Implement account deletion flow -- add DELETE /api/users/me route that closes all active listings, withdraws all pending offers, anonymizes reviews (set reviewer_id to NULL), deletes user data after 30-day grace period, notifies counterparties
- [ ] T105 [P] Add responsive mobile layout adjustments across all pages -- verify listing grid switches to single column on mobile, filter sidebar becomes a collapsible drawer, messaging thread is full-screen on mobile, navigation collapses to hamburger menu
- [ ] T106 [P] Add loading states and skeleton components for listing grid, offer list, message thread, and notification list using shadcn/ui Skeleton component
- [ ] T107 [P] Add error boundary components at `src/components/error-boundary.tsx` and 404/error pages at `src/app/not-found.tsx` and `src/app/error.tsx`
- [ ] T108 Add TanStack Query configuration in `src/lib/query-client.ts` with default stale times, retry logic, and query key factories for listings, offers, messages, notifications, users; integrate optimistic updates for message sending and notification read marking
- [ ] T109 Run full end-to-end validation of quickstart.md setup steps -- verify fresh clone, pnpm install, supabase start, db:migrate, db:seed, and dev server all work correctly

---

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies -- start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 -- BLOCKS all user stories
- **Phase 3 (US1 Listings)**: Depends on Phase 2
- **Phase 4 (US2 Offers)**: Depends on Phase 2 + Phase 3 (offers reference listings)
- **Phase 5 (US3 Search)**: Depends on Phase 2 + Phase 3 (search operates on listings)
- **Phase 6 (US4 Messaging)**: Depends on Phase 2 + Phase 4 (messages are per-offer)
- **Phase 7 (US5 Alerts)**: Depends on Phase 2 + Phase 3 (alerts match against listings)
- **Phase 8 (US6 Profiles)**: Depends on Phase 2 + Phase 4 (reviews require accepted offers)
- **Phase 9 (US7 Notifications)**: Depends on Phase 2 + all prior services that generate notifications
- **Phase 10 (Polish)**: Depends on all desired user stories being complete

### Parallel Opportunities

- Within Phase 1: T003, T004, T005, T006 can run in parallel
- Within Phase 2: All [P] tasks can run in parallel after T007-T008 (schema must come first)
- Phase 4 and Phase 5 can run in parallel after Phase 3 completes
- Phase 7 (Alerts) can run in parallel with Phase 6 (Profiles) after Phase 4
- All Phase 10 tasks marked [P] can run in parallel

### Within Each Phase

- Schema/service before API routes
- API routes before UI components
- Components before pages that compose them
- Commit after each task or logical group
