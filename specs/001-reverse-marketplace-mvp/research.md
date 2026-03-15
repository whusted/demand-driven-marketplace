# Research: Reverse Marketplace MVP

**Branch**: `001-reverse-marketplace-mvp` | **Date**: 2026-03-15

## R1: Full-Text Search Strategy

**Decision**: PostgreSQL `tsvector` / `tsquery` with GIN indexes via Drizzle ORM

**Rationale**: At MVP scale (~10k listings), Postgres full-text search is more than sufficient — no external search service needed. GIN indexes on a generated `tsvector` column combining title, description, and tag names give fast ranked results. `ts_rank` handles relevance sorting. This avoids adding Typesense/Meilisearch infrastructure for a problem Postgres handles natively.

**Alternatives considered**:
- Typesense: Excellent search quality and typo tolerance, but adds an external service to manage, sync data to, and pay for. Overkill at MVP scale.
- Meilisearch: Similar tradeoffs to Typesense. Better suited when search is the primary UX (e.g., e-commerce catalog).
- pg_trgm (trigram): Good for fuzzy matching but slower than tsvector for ranked full-text search. Could complement tsvector later for autocomplete.
- LIKE/ILIKE: No ranking, no stemming, poor performance at scale. Not viable.

## R2: Real-Time Messaging Architecture

**Decision**: Supabase Realtime (Postgres Changes) for message delivery + optimistic UI updates

**Rationale**: Supabase Realtime broadcasts row-level changes from Postgres via WebSockets. For offer-scoped messaging, subscribe to changes on the `messages` table filtered by `offer_id`. This gives real-time delivery with zero additional infrastructure — the database is the source of truth and the event bus. Pair with TanStack Query for optimistic updates and cache invalidation.

**Alternatives considered**:
- Server-Sent Events (SSE): Simpler protocol but requires custom server-side event dispatching. Doesn't leverage Supabase's built-in capabilities.
- Polling: Simplest implementation but poor UX (delayed messages) and wasteful at scale.
- WebSocket server (custom): Full control but significant implementation effort for MVP. Supabase Realtime is effectively this, managed.
- Ably/Pusher: Managed WebSocket services but add cost and another external dependency when Supabase already provides this.

## R3: Image Upload & Storage

**Decision**: Client-side direct upload to Supabase Storage with signed URLs, server-side validation of metadata

**Rationale**: Direct upload avoids routing large files through the Next.js API (Vercel has a 4.5MB body limit on serverless functions). The flow: client requests a signed upload URL from the API, uploads directly to Supabase Storage, then sends the resulting URL back to the API for association with the listing/offer/message. Supabase Storage provides CDN-backed delivery via their CDN. Server validates file type and size constraints.

**Alternatives considered**:
- Server-side upload proxy: Simpler auth model but hits Vercel's body size limits and adds latency.
- S3 + CloudFront: More control and potentially cheaper at scale, but adds AWS configuration complexity. Supabase Storage wraps S3 with simpler DX.
- Cloudinary: Excellent image transformation features but adds cost and vendor lock-in for features we don't need in MVP.

## R4: Seller Alert Matching

**Decision**: Trigger-based matching on listing insert using Supabase Edge Functions

**Rationale**: When a new listing is inserted, a Postgres trigger (or Supabase Database Webhook) fires a Supabase Edge Function that queries `seller_alerts` for matching criteria (category, tags, keywords via full-text search against the listing). Matching alerts generate notification records. This is event-driven and doesn't require a polling job or queue. At MVP scale, the matching query is fast enough to run synchronously in the function.

**Alternatives considered**:
- Cron job polling: Simple but introduces latency (checking every N minutes) and wastes resources scanning unchanged data.
- Postgres LISTEN/NOTIFY: Lightweight pub/sub but requires a persistent listener process — not serverless-friendly.
- External queue (Bull, SQS): Production-grade but massive overkill for MVP. Worth revisiting if alert volume exceeds Edge Function execution limits.

## R5: Authentication & Authorization

**Decision**: Supabase Auth with email/password + Google OAuth, Row Level Security (RLS) for data access control

**Rationale**: Supabase Auth provides a complete auth system with session management, JWT tokens, and OAuth provider integration out of the box. RLS policies on Postgres tables enforce that users can only access their own data (e.g., a buyer's offers are only visible to the buyer, not other sellers). This pushes authorization to the database layer, reducing application-level auth bugs.

**Alternatives considered**:
- Auth.js (NextAuth): Mature Next.js auth library but requires more manual setup for session management and doesn't integrate with RLS. Would need application-level authorization checks everywhere.
- Clerk: Polished auth UI components but adds monthly cost and another vendor. Supabase Auth is included free with Supabase.
- Custom JWT auth: Maximum flexibility but significant security implementation burden for MVP.

## R6: Notification Delivery (Email)

**Decision**: Resend for transactional email, triggered from Supabase Edge Functions alongside in-app notification creation

**Rationale**: When a notification-worthy event occurs (new offer, new message, alert match), the same Edge Function that creates the in-app notification record also sends an email via Resend's API. Resend has excellent deliverability, a generous free tier (100 emails/day, 3,000/month), and a clean TypeScript SDK. Email templates can be React components via react-email.

**Alternatives considered**:
- SendGrid: Industry standard but more complex setup and pricing. Free tier is 100 emails/day.
- Postmark: Best deliverability reputation but higher cost and no free tier for production.
- SES: Cheapest at scale but requires AWS setup, domain verification, and sandbox escape. Overkill for MVP.
- No email (in-app only): Reduces engagement significantly — users won't check the site without prompts.

## R7: Data Validation Strategy

**Decision**: Zod schemas shared between client and server, with Drizzle schema as the database-level constraint layer

**Rationale**: Define Zod schemas for all API inputs (listing creation, offer submission, etc.) that validate on both client (form validation) and server (API route validation). Drizzle schema definitions enforce database-level constraints (NOT NULL, foreign keys, check constraints). This gives three layers of validation: client UX, server correctness, database integrity — with Zod schemas as the single source of truth for business rules.

**Alternatives considered**:
- Yup: Similar validation library but less TypeScript-native than Zod. Zod's `.infer<>` for type generation is a significant DX advantage.
- No shared schemas: Separate client/server validation leads to drift and duplicated logic.
- Database-only validation: Poor UX (errors surface late) and limits the quality of error messages.
