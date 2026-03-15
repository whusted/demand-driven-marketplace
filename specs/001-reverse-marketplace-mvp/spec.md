# Feature Specification: Reverse Marketplace MVP

**Feature Branch**: `001-reverse-marketplace-mvp`
**Created**: 2026-03-15
**Status**: Draft
**Input**: User description: "Reverse marketplace where buyers post wanted listings for rare/collectible items and sellers respond with offers. Core features: wanted listings with descriptions/photos/tags/price, seller offer responses, messaging, search/browse, seller alerts and notifications."

## Clarifications

### Session 2026-03-15

- Q: Can a seller submit multiple offers on the same wanted listing? → A: Yes — a seller can submit multiple distinct offers on the same listing.
- Q: Can a fulfilled listing be reopened if the transaction falls through? → A: Yes — buyer can reopen a fulfilled listing back to active; previously declined offers remain declined.
- Q: Can sellers see other sellers' offers on a listing? → A: No — only the buyer can see submitted offers. Offers are private to the buyer-seller pair.
- Q: What level of abuse prevention for MVP? → A: Minimal — user reporting only, no automated prevention or rate limiting.
- Q: What happens to reviews when a user deletes their account? → A: Anonymize — reviews persist with identity replaced by "Deleted User"; other users' reputation scores remain intact.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Buyer Creates a Wanted Listing (Priority: P1)

A collector is searching for a specific rare item — for example, a 1985 Prince Purple Rain tour shirt from the Minneapolis show, size L, mint condition. They create a "Wanted Listing" on the platform, providing a detailed description of the item, the condition they need, the maximum price they're willing to pay, optional reference photos, relevant tags (e.g., "vintage", "concert tee", "Prince", "1985"), and their location/shipping preferences. The listing is published and becomes discoverable by sellers browsing or receiving alerts.

**Why this priority**: This is the foundational action of the entire platform. Without buyers posting demand, there is no marketplace. A working wanted listing system alone delivers value — it creates a public signal of demand that doesn't exist elsewhere.

**Independent Test**: Can be fully tested by a user creating an account, posting a wanted listing with all fields, and seeing it appear in search results. Delivers immediate value as a public demand board.

**Acceptance Scenarios**:

1. **Given** a registered user, **When** they fill out the wanted listing form with title, description, condition, max price, tags, and location preference, **Then** the listing is published and visible in search results within 5 seconds.
2. **Given** a user creating a listing, **When** they upload up to 5 reference photos, **Then** the photos are displayed alongside the listing description.
3. **Given** a user creating a listing, **When** they add tags (existing or new), **Then** the tags are associated with the listing and the listing appears in tag-based searches.
4. **Given** a user creating a listing, **When** they set a maximum price of $0 (open to offers), **Then** the listing displays "Open to offers" instead of a price.
5. **Given** a user with an active listing, **When** they edit the listing details, **Then** the changes are reflected immediately and existing offers are preserved.

---

### User Story 2 - Seller Browses and Responds with an Offer (Priority: P1)

A person who owns a rare item (or regularly sources collectibles) browses the marketplace to see if anyone is looking for items they have. They find a wanted listing matching something they own, and submit an offer that includes photos of their actual item, the asking price, condition description, and shipping/meetup preferences. The buyer receives a notification about the new offer.

**Why this priority**: Equal to P1 because the two-sided interaction (demand + supply response) is the core value loop. Without seller offers, buyer listings have no resolution path.

**Independent Test**: Can be tested by a seller viewing a listing, submitting an offer with photos and price, and the buyer seeing the offer on their listing. Delivers the core marketplace transaction initiation.

**Acceptance Scenarios**:

1. **Given** a registered user viewing an active wanted listing they did not create, **When** they submit an offer with at least one photo, asking price, and condition, **Then** the offer is recorded and the buyer is notified.
2. **Given** a seller submitting an offer, **When** the asking price exceeds the buyer's max price, **Then** the offer is still accepted but the buyer sees a visual indicator that it exceeds their stated budget.
3. **Given** a buyer viewing their listing, **When** multiple sellers have submitted offers, **Then** the buyer sees all offers sorted by most recent, with photos, price, and condition visible.
4. **Given** a buyer reviewing offers, **When** they accept an offer, **Then** the offer status changes to "accepted" and the listing status changes to "fulfilled."
5. **Given** a buyer reviewing offers, **When** they decline an offer, **Then** the seller is notified and the offer status changes to "declined."
6. **Given** a seller with a pending offer, **When** they decide to withdraw it, **Then** the offer is removed and the buyer is notified.

---

### User Story 3 - Search and Discovery (Priority: P1)

A seller (or curious browser) arrives at the platform and wants to find wanted listings relevant to what they own or deal in. They use full-text search, filter by category, tags, location, or price range, and sort results by relevance or recency. They can browse categories to discover demand they didn't know existed.

**Why this priority**: P1 because without effective discovery, sellers can't find relevant listings and the demand signal is wasted. Search is the bridge between posted demand and potential supply.

**Independent Test**: Can be tested by creating several listings with different tags/categories, then searching with various queries and filters to verify relevant results appear. Delivers value by making demand discoverable.

**Acceptance Scenarios**:

1. **Given** a user on the marketplace, **When** they search for "vintage guitar pedal," **Then** listings containing those terms (in title, description, or tags) appear ranked by relevance.
2. **Given** a user browsing listings, **When** they filter by category "Vinyl Records" and tag "Jazz," **Then** only listings matching both criteria are shown.
3. **Given** a user searching, **When** they filter by location "Chicago" and check "local pickup only," **Then** only listings from Chicago-area buyers who accept local pickup appear.
4. **Given** a user searching, **When** they sort by "newest first," **Then** results are ordered by listing creation date descending.
5. **Given** a user searching, **When** no listings match their query, **Then** they see a "No results" message with suggestions to broaden their search or create a seller alert.

---

### User Story 4 - Buyer-Seller Messaging (Priority: P2)

After a seller submits an offer, the buyer and seller need to discuss details — negotiate price, ask about condition specifics, arrange shipping or meetup logistics. A threaded messaging system tied to each offer enables this conversation. Both parties receive notifications for new messages.

**Why this priority**: P2 because the marketplace can technically function at a basic level with just offers (accept/decline), but real transactions almost always require back-and-forth communication. This is essential for user retention and transaction completion.

**Independent Test**: Can be tested by having a buyer and seller exchange messages on an offer thread, including image attachments, and verifying both parties see the conversation and receive notifications.

**Acceptance Scenarios**:

1. **Given** a buyer viewing an offer on their listing, **When** they send a message, **Then** the seller sees the message in the offer's conversation thread and receives a notification.
2. **Given** a seller with a pending offer, **When** they send a message to the buyer, **Then** the buyer sees it in the conversation thread for that offer and receives a notification.
3. **Given** a user in a conversation, **When** they attach an image (e.g., close-up photo of item condition), **Then** the image is displayed inline in the message thread.
4. **Given** a user with unread messages, **When** they open the conversation thread, **Then** messages are marked as read and the unread indicator is cleared.

---

### User Story 5 - Seller Alerts (Priority: P2)

A seller who regularly deals in specific categories (e.g., vintage audio equipment, rare sneakers) sets up alert subscriptions by choosing categories, tags, and keywords. When a new wanted listing is posted that matches their alert criteria, they receive a notification (email and/or in-app) so they can respond quickly.

**Why this priority**: P2 because while sellers can manually browse, alerts dramatically increase the chance of matching supply to demand — especially for sellers who won't check the site daily. This is a key differentiator from traditional marketplaces.

**Independent Test**: Can be tested by a seller creating an alert for "vintage synthesizer," then a buyer posting a matching listing, and verifying the seller receives a notification within a reasonable timeframe.

**Acceptance Scenarios**:

1. **Given** a registered seller, **When** they create an alert with category "Musical Instruments" and keywords "vintage synthesizer," **Then** the alert is saved and active.
2. **Given** a seller with an active alert, **When** a buyer posts a listing matching the alert criteria, **Then** the seller receives a notification within 5 minutes.
3. **Given** a seller with multiple alerts, **When** they view their alerts dashboard, **Then** they see all active alerts with options to edit or delete each one.
4. **Given** a seller receiving alert notifications, **When** they click the notification, **Then** they are taken directly to the matching listing.

---

### User Story 6 - User Accounts and Profiles (Priority: P2)

Users create accounts to participate in the marketplace. Their public profile displays their username, bio, location, and reputation score. Other users can view a profile to assess trustworthiness before transacting. Reputation is built through completed transactions and reviews.

**Why this priority**: P2 because basic account functionality is needed for any user action, but the reputation/review layer can be simplified initially. Trust is critical for a marketplace dealing in rare/high-value items.

**Independent Test**: Can be tested by creating an account, editing a profile, and viewing another user's public profile. Delivers value by establishing identity and trust.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they register with email and password or via a social login provider, **Then** their account is created and they can immediately create listings or submit offers.
2. **Given** a registered user, **When** they edit their display name, bio, avatar, and location, **Then** the changes appear on their public profile.
3. **Given** any user, **When** they view another user's profile, **Then** they see the user's display name, bio, location, reputation score, and recent activity (listings created, offers made).
4. **Given** a completed transaction (offer accepted), **When** either party leaves a review with a 1-5 star rating and comment, **Then** the review is visible on the reviewed user's profile and their reputation score updates.

---

### User Story 7 - Notifications Center (Priority: P3)

Users have a centralized notifications inbox where they can see all platform activity relevant to them: new offers on their listings, new messages, alert matches, offer status changes, and reviews received. They can mark notifications as read, and an unread count badge is visible across the platform.

**Why this priority**: P3 because the platform can function with individual email notifications initially, but a centralized in-app notification center significantly improves the user experience and engagement.

**Independent Test**: Can be tested by triggering various notification events (new offer, new message, alert match) and verifying they appear in the notifications center with correct content and read/unread status.

**Acceptance Scenarios**:

1. **Given** a user with new notifications, **When** they view the notifications center, **Then** they see all notifications sorted by most recent with unread items visually distinguished.
2. **Given** a user viewing a notification, **When** they click it, **Then** they are navigated to the relevant context (listing, offer, conversation) and the notification is marked as read.
3. **Given** a user with many notifications, **When** they click "mark all as read," **Then** all notifications are marked as read and the unread count resets to zero.

---

### Edge Cases

- What happens when a buyer tries to submit an offer on their own listing? System must prevent self-offers.
- What happens when a listing expires while a seller is mid-offer? The seller should be notified and unable to submit.
- What happens when a buyer accepts an offer but the seller has already withdrawn it? The system must handle the race condition gracefully and notify the buyer.
- What happens when a user uploads an image that exceeds the size limit? The system should reject the upload with a clear error message and file size guidance.
- What happens when a search query contains special characters or is extremely long? The system should sanitize input and return graceful results or an appropriate message.
- What happens when a seller alert matches dozens of new listings simultaneously? Notifications should be batched or throttled to avoid overwhelming the user.
- What happens when a user deletes their account while they have active listings or pending offers? The system must handle cleanup — close listings, notify counterparties. Reviews written by or about the deleted user are preserved with identity replaced by "Deleted User"; other users' reputation scores remain unaffected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with email/password and at least one social login provider.
- **FR-002**: System MUST allow authenticated users to create wanted listings with: title (required), description (required), category, condition preference, maximum price, location, shipping/local preferences, up to 5 reference photos, and tags.
- **FR-003**: System MUST support a hierarchical category system (e.g., "Clothing > Vintage > Concert Tees") for organizing listings.
- **FR-004**: System MUST support a tagging system where users can apply existing tags or create new ones when posting listings.
- **FR-005**: System MUST allow authenticated users to submit multiple distinct offers on the same listing they did not create, each including: at least one photo (required), asking price, condition description, and shipping/meetup preference. Offers are visible only to the buyer and the submitting seller — not to other sellers.
- **FR-006**: System MUST allow buyers to accept or decline offers on their listings, with appropriate status transitions and notifications.
- **FR-007**: System MUST provide full-text search across listing titles, descriptions, and tags.
- **FR-008**: System MUST support filtering search results by category, tags, location, price range, condition, and listing status.
- **FR-009**: System MUST support sorting search results by relevance and recency.
- **FR-010**: System MUST provide threaded messaging between buyer and seller for each offer, with support for text and image messages.
- **FR-011**: System MUST notify users of relevant events: new offers, new messages, offer status changes, and alert matches — via both in-app notifications and email.
- **FR-012**: System MUST allow sellers to create alert subscriptions based on categories, tags, and keywords.
- **FR-013**: System MUST match new listings against active seller alerts and notify matching sellers within 5 minutes of listing publication.
- **FR-014**: System MUST display public user profiles with display name, bio, location, reputation score, and recent activity.
- **FR-015**: System MUST support a review system where transaction participants can leave 1-5 star ratings and comments after an offer is accepted.
- **FR-016**: System MUST prevent users from submitting offers on their own listings.
- **FR-017**: System MUST support listing lifecycle states: active, fulfilled (offer accepted), expired (past expiration date), and closed (manually closed by buyer). A fulfilled listing can be reopened to active by the buyer if the transaction falls through; previously declined offers remain declined.
- **FR-018**: System MUST allow buyers to set an optional expiration date on listings, after which the listing automatically transitions to "expired" status.
- **FR-019**: System MUST allow users to upload images (photos of items, reference images) with a maximum file size of 10MB per image, supporting common formats (JPEG, PNG, WebP).

### Key Entities

- **User**: A registered person on the platform. Can act as both buyer and seller. Has a profile with display name, bio, avatar, location, and reputation score. Owns listings, offers, messages, alerts, and reviews.
- **Wanted Listing**: The core entity — a buyer's public request for a specific item. Contains descriptive information (title, description, condition, price), categorization (category, tags), logistics (location, shipping preference), reference images, and lifecycle status. Belongs to one buyer, can receive many offers.
- **Offer**: A seller's response to a wanted listing. Contains item evidence (photos, condition description), pricing (asking price), and logistics (shipping method). Has a status lifecycle: pending, accepted, declined, withdrawn. Belongs to one seller and one listing. Has one message thread.
- **Message**: A communication between buyer and seller within an offer's conversation thread. Contains text and optional image. Tracks read status.
- **Category**: A hierarchical classification for organizing listings (e.g., "Electronics > Audio > Vintage Amplifiers"). Supports parent-child relationships.
- **Tag**: A user-defined label for cross-cutting classification of listings (e.g., "rare", "mint condition", "1980s"). Many-to-many relationship with listings.
- **Seller Alert**: A subscription a seller creates to be notified of new listings matching specific categories, tags, and keywords.
- **Notification**: A record of a platform event relevant to a user (new offer, message, alert match, status change). Tracks read status and links to the relevant context.
- **Review**: A post-transaction rating (1-5 stars) and comment left by one transaction participant about the other. Updates the reviewee's reputation score.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a complete wanted listing (all fields, photos, and tags) in under 3 minutes.
- **SC-002**: Users can find relevant listings through search within 10 seconds of entering a query.
- **SC-003**: 95% of search queries return results in under 1 second.
- **SC-004**: Sellers receive alert notifications for matching new listings within 5 minutes of publication.
- **SC-005**: Buyers can review and respond to an offer (accept, decline, or message) within 30 seconds of opening it.
- **SC-006**: The platform supports at least 1,000 concurrent users without noticeable performance degradation.
- **SC-007**: 80% of wanted listings receive at least one offer within 30 days of posting (once the platform reaches 500+ active sellers).
- **SC-008**: 70% of users who receive an offer engage in at least one message exchange, indicating the messaging system supports active negotiation.
- **SC-009**: Users rate the listing creation experience 4+ stars out of 5 in post-action feedback surveys.
- **SC-010**: The average time from listing creation to first offer decreases over time as seller alerts drive faster matching.

## Assumptions

- Users will primarily be collectors, hobbyists, and niche item enthusiasts — not general consumers looking for commodity products.
- The platform does not handle payments or escrow in the MVP. Buyers and sellers arrange payment independently after connecting through the platform.
- Content moderation will initially be handled through a user reporting system only — no automated prevention, rate limiting, or spam detection in the MVP. Manual review of reported content as needed.
- Email delivery for notifications will use a third-party transactional email service with standard deliverability expectations.
- Image storage and delivery will use a CDN-backed object storage service for acceptable load times.
- Data retention follows standard industry practices — user data persists as long as the account is active, with a 30-day grace period after account deletion.
- The platform launches as a web application. Mobile apps are a future consideration, but the web experience must be fully responsive.
- Geographic location is entered as free text (city/region), not precise GPS coordinates — privacy by default.
- There is no limit on the number of active listings per user in the MVP, but this may be introduced if abuse patterns emerge.
