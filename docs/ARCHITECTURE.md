# Architecture

## Overview

Diiff is a faith-centered wellness platform for ages 16–25 in NYC. The primary architectural constraint is defense-in-depth age safety: every content gate exists at four independent layers.

## Request Flow

```
Client Request
     │
     ▼
┌─────────────────────────────┐
│  Next.js Middleware          │  ← Session refresh (Supabase SSR)
│  middleware.ts               │    Redirect unauthenticated → /login
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Route Handler / Page        │  ← Layer 4: API-level age check
│  apps/web/app/api/**         │    resolveAgeTier() from DB
│  apps/web/app/(app)/**       │    assertCapability() before any action
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Service Layer               │  ← Layer 3: Service-level enforcement
│  services/feed               │    Minor audience enforced in getFeed()
│  services/auth               │    Capabilities checked before mutations
│  services/moderation         │    Perspective API screening
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Row-Level Security          │  ← Layer 2: RLS as canonical gate
│  db/policies/**              │    Minor sees only all_ages content
│  (Supabase enforces on       │    caller_is_minor() reads from DB row
│   every query)               │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Database Triggers           │  ← Layer 1: Last-resort DB enforcement
│  db/migrations/**            │    enforce_minor_audience()
│                              │    enforce_room_creator_age()
│                              │    enforce_participant_safety()
└─────────────────────────────┘
```

## Invariants

| Invariant | Where Enforced |
|-----------|---------------|
| `age_tier` is never accepted from client input | API routes (PATCH /api/users/me rejects it) |
| `age_tier` is computed from `date_of_birth` only | `services/auth/index.ts: computeAndStoreAgeTier()` |
| Minors never see `adults_only` posts | RLS `posts_select_approved` + service `getFeed()` |
| Minors cannot create `adults_only` posts | DB trigger + RLS `posts_insert_own` + service layer |
| Minors cannot create rooms | DB trigger + RLS `rooms_insert_young_adult` + capabilities |
| Minors cannot join unmoderated rooms | DB trigger + RLS `can_join_room()` |
| `moderation_flags` rows are immutable (no DELETE) | REVOKE DELETE in migration + no RLS DELETE policy |
| `is_staff` can never be set by a user | API route PATCH explicitly rejects this field |
| Session validated via `getUser()`, not `getSession()` | `services/auth/index.ts: resolveSession()` |
| Voice features are not live | `services/voice/index.ts` is `export {}` only |

## Tech Stack

| Concern | Technology |
|---------|-----------|
| Frontend | Next.js 14 App Router, React 18, TypeScript strict |
| Styling | Tailwind CSS 3, CSS custom properties |
| Auth | Supabase Auth (Google + Apple OAuth only) |
| Database | PostgreSQL via Supabase |
| Realtime | Supabase Realtime (Phase 2) |
| Storage | Supabase Storage |
| Text moderation | Google Perspective API (fail-open) |
| TTS | ElevenLabs (server-side only, scripted text only) |
| Package manager | pnpm workspaces |
| CI/CD | GitHub Actions → Vercel |

## Monorepo Layout

```
apps/
  web/          Next.js app (primary product)
  api/          Future standalone API service (empty at launch)
services/
  auth/         Session resolution, age tier, capabilities
  feed/         Post creation, feed querying, moderation gate
  moderation/   Perspective API classifier, flag management
  ai/           ElevenLabs TTS, daily scripture rotation
  voice/        Phase 2 placeholder (empty export)
db/
  migrations/   Numbered SQL migrations (run in order)
  policies/     RLS policy files (applied after migrations)
infra/
  terraform/    Future IaC (empty at launch)
  configs/      Static service configs
docs/           Architecture, policy, and decision documentation
.github/
  workflows/    CI + age-policy guard
```

## Session Validation Rule

All server-side code that needs the current user **must** call `supabase.auth.getUser()`. Calling `getSession()` is **forbidden** — it reads from the cookie without re-validating with the auth server, making it spoofable.

```typescript
// CORRECT
const { data: { user } } = await supabase.auth.getUser();

// FORBIDDEN — never do this in server code
const { data: { session } } = await supabase.auth.getSession();
```
