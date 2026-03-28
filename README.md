# Diiff

A faith-centered wellness platform for ages 16–25 in New York City.

Move. Reflect. Connect.

---

## Stack

| Concern | Technology |
|---------|-----------|
| Frontend | Next.js 14 App Router, React 18, TypeScript strict |
| Styling | Tailwind CSS 3 with custom brand tokens |
| Auth | Supabase Auth (Google + Apple OAuth only) |
| Database | PostgreSQL via Supabase with Row-Level Security |
| Text moderation | Google Perspective API |
| TTS | ElevenLabs (server-side only) |
| Package manager | pnpm workspaces |
| CI/CD | GitHub Actions → Vercel |

## Quick Start

```sh
# Install dependencies
pnpm install

# Copy and fill environment variables
cp .env.example .env.local

# Start local Supabase (requires Supabase CLI)
npx supabase start

# Run DB migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
apps/web/       Next.js application
services/       Shared business logic
db/             SQL migrations and RLS policies
docs/           Architecture and policy documentation
infra/          Infrastructure config (future)
.github/        CI workflows
```

See [docs/REPO_STRUCTURE.md](docs/REPO_STRUCTURE.md) for the full annotated tree.

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Request flow, invariants, tech stack |
| [AGE_POLICY.md](docs/AGE_POLICY.md) | Age enforcement — read before touching auth or RLS |
| [PRODUCT_MODEL.md](docs/PRODUCT_MODEL.md) | Mission, core loop, surfaces, non-goals |
| [VOICE_SYSTEM.md](docs/VOICE_SYSTEM.md) | Phase 2 voice architecture and prerequisites |
| [AI_USAGE.md](docs/AI_USAGE.md) | Approved AI uses, prohibited uses, crisis resources |
| [MODERATION.md](docs/MODERATION.md) | Three-layer moderation philosophy |
| [DATA_MODEL.md](docs/DATA_MODEL.md) | All database tables with column descriptions |
| [SECURITY.md](docs/SECURITY.md) | Auth, transport, RLS, secrets, abuse prevention |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Environments, CI/CD, migration discipline |
| [ROADMAP.md](docs/ROADMAP.md) | Four phases with deliverables and exit criteria |
| [DECISION_LOG.md](docs/DECISION_LOG.md) | Architectural decision records (ADRs) |
| [AGENTS.md](AGENTS.md) | Rules for AI coding assistants — read before contributing |

## Age Safety

Diiff hosts minor users (ages 16–17). Age enforcement is implemented at four independent layers: database triggers, Row-Level Security policies, service functions, and API route handlers.

**`age_tier` is always server-computed from `date_of_birth` stored in the database. It is never accepted from client input or JWT claims.**

Before modifying any auth, RLS, or content-gating code, read [docs/AGE_POLICY.md](docs/AGE_POLICY.md).

## Scripts

```sh
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript type check
pnpm test         # Vitest unit tests
pnpm db:migrate   # Run pending DB migrations
pnpm db:reset     # Reset local DB (destructive)
pnpm db:types     # Regenerate TypeScript types from DB schema
```

---

Built for the World Labs Hackathon, 2025.
