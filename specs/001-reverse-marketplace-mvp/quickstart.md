# Quickstart: Reverse Marketplace MVP

**Branch**: `001-reverse-marketplace-mvp` | **Date**: 2026-03-15

## Prerequisites

- Node.js 20+
- pnpm (package manager)
- Supabase CLI (`npx supabase`)
- Git

## Setup

```bash
# Clone and install
git clone <repo-url>
cd demand-driven-marketplace
pnpm install

# Start local Supabase (Postgres, Auth, Storage, Realtime)
npx supabase start

# Apply database migrations
pnpm db:migrate

# Seed development data
pnpm db:seed

# Copy environment template
cp .env.example .env.local
# Fill in values from `npx supabase status`

# Start dev server
pnpm dev
```

App runs at `http://localhost:3000`.
Supabase Studio at `http://localhost:54323`.

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:e2e` | Run Playwright e2e tests |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:generate` | Generate migration from schema changes |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm db:studio` | Open Drizzle Studio (DB browser) |
| `npx supabase start` | Start local Supabase stack |
| `npx supabase stop` | Stop local Supabase stack |

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<from supabase status>

# Database (direct connection for Drizzle)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Resend (email)
RESEND_API_KEY=<your key>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Architecture At A Glance

```
Browser → Next.js (Vercel) → Supabase Postgres
                            → Supabase Auth
                            → Supabase Storage (images)
                            → Supabase Realtime (messages/notifications)
                            → Resend (email)
```

- **Pages & UI**: `src/app/` (Next.js App Router with RSC)
- **API routes**: `src/app/api/` (thin handlers that call services)
- **Business logic**: `src/services/` (pure functions, testable)
- **Database**: `src/db/schema.ts` (Drizzle ORM, single source of truth)
- **Validation**: `src/lib/validators/` (Zod schemas, shared client/server)
- **Components**: `src/components/` (shadcn/ui based)

## Development Workflow

1. Create a feature branch from `main`
2. Make schema changes in `src/db/schema.ts`
3. Generate migration: `pnpm db:generate`
4. Apply migration: `pnpm db:migrate`
5. Implement service logic in `src/services/`
6. Add API route in `src/app/api/`
7. Build UI in `src/app/` and `src/components/`
8. Write tests
9. Open PR
