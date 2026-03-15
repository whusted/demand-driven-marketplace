# Implementation Plan: Reverse Marketplace MVP

**Branch**: `001-reverse-marketplace-mvp` | **Date**: 2026-03-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-reverse-marketplace-mvp/spec.md`

## Summary

Build a demand-driven marketplace where buyers post wanted listings for rare/collectible items and sellers respond with offers. The MVP is a full-stack web application covering: wanted listings with search/filtering, private seller offers, threaded messaging, seller alert subscriptions, user profiles with reputation, and notifications. The platform uses a Next.js monorepo with Supabase for database, auth, storage, and realtime capabilities — optimized for fast solo-dev iteration.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 15 (App Router, React Server Components), Tailwind CSS 4, shadcn/ui, Drizzle ORM, TanStack Query
**Storage**: PostgreSQL 15+ (via Supabase), Supabase Storage (images), Supabase Realtime (messaging/notifications)
**Auth**: Supabase Auth (email/password only for MVP; Google OAuth deferred)
**Email**: Deferred — in-app notifications only for MVP (Resend integration deferred)
**Testing**: Vitest (unit), Playwright (e2e)
**Target Platform**: Web (responsive, mobile-friendly) — deployed on Vercel
**Project Type**: Full-stack web application (monorepo)
**Performance Goals**: <1s search results (95th percentile), <5s page loads, 1,000 concurrent users
**Constraints**: No payment processing in MVP, free-text location (no geocoding), minimal abuse prevention (user reporting only), local Supabase only (no cloud project yet), email/password auth only, no email notifications
**Scale/Scope**: Initial target ~1,000 users, ~10,000 listings, ~50,000 offers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution was not configured (skipped `/speckit.constitution`). No gates to evaluate. Proceeding with standard best practices:
- Type safety enforced via TypeScript strict mode
- All entities validated at API boundaries with Zod
- Tests required for critical paths (auth, offers, search)
- Simple architecture — no premature abstractions

## Project Structure

### Documentation (this feature)

```text
specs/001-reverse-marketplace-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
├── checklists/          # Spec quality checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Auth routes (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (main)/                 # Authenticated layout
│   │   ├── listings/           # Browse, search, create, detail
│   │   │   ├── [id]/
│   │   │   │   └── offers/     # Offers on a listing (buyer view)
│   │   │   ├── new/
│   │   │   └── page.tsx        # Search/browse
│   │   ├── offers/             # My submitted offers (seller view)
│   │   ├── messages/           # Conversation threads
│   │   ├── alerts/             # Seller alert management
│   │   ├── notifications/      # Notification center
│   │   └── profile/            # Own profile + settings
│   │       └── [id]/           # Public profile view
│   ├── api/                    # API route handlers
│   │   ├── listings/
│   │   ├── offers/
│   │   ├── messages/
│   │   ├── alerts/
│   │   ├── notifications/
│   │   ├── reviews/
│   │   ├── upload/
│   │   └── users/
│   ├── layout.tsx
│   └── page.tsx                # Landing/home
├── components/                 # Shared UI components
│   ├── ui/                     # shadcn/ui primitives
│   ├── listings/               # Listing-specific components
│   ├── offers/                 # Offer-specific components
│   ├── messages/               # Messaging components
│   └── layout/                 # Navigation, sidebar, etc.
├── db/                         # Database layer
│   ├── schema.ts               # Drizzle schema definitions
│   ├── migrations/             # SQL migrations
│   └── index.ts                # DB client
├── lib/                        # Shared utilities
│   ├── supabase/               # Supabase client (server + browser)
│   ├── validators/             # Zod schemas for API validation
│   ├── utils.ts                # General utilities
│   └── constants.ts
├── services/                   # Business logic layer
│   ├── listings.ts
│   ├── offers.ts
│   ├── messages.ts
│   ├── alerts.ts
│   ├── notifications.ts
│   ├── reviews.ts
│   ├── search.ts
│   └── upload.ts
└── types/                      # Shared TypeScript types
    └── index.ts

tests/
├── e2e/                        # Playwright end-to-end tests
│   ├── listings.spec.ts
│   ├── offers.spec.ts
│   └── auth.spec.ts
└── unit/                       # Vitest unit tests
    ├── services/
    └── validators/

supabase/
├── config.toml                 # Supabase local config
└── seed.sql                    # Seed data for development
```

**Structure Decision**: Single Next.js project with colocated API routes. Business logic lives in `services/` to keep route handlers thin. Database schema managed via Drizzle with migration files. This is the simplest viable architecture — no microservices, no separate backend, no monorepo tooling needed.

## Complexity Tracking

No constitution violations to justify. Architecture is deliberately minimal:
- Single deployment unit (Vercel)
- Single database (Supabase Postgres)
- No external services beyond Supabase + Resend
- No caching layer (Postgres full-text search is sufficient at MVP scale)
