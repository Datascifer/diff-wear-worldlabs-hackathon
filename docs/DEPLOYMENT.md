# Deployment

## Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Production | `main` | `diiff.app` (planned) | Live users |
| Preview | Any PR branch | Vercel preview URL | PR review |
| Local | — | `localhost:3000` | Development |

There is no dedicated staging environment at launch. Preview deployments serve this role.

## Infrastructure

- **Frontend**: Vercel (Next.js 14, automatic CI/CD from GitHub)
- **Database + Auth + Storage**: Supabase (managed PostgreSQL)
- **DNS**: Planned — Cloudflare
- **TTS**: ElevenLabs (API call from server-side Route Handlers)
- **Moderation**: Google Perspective API (API call from server-side service)

## CI/CD

Every push to a PR branch runs the GitHub Actions `ci.yml` workflow:

1. `lint` — ESLint with zero-tolerance for `no-explicit-any` and `no-floating-promises`
2. `typecheck` — `tsc --noEmit` with strict mode
3. `test` — Vitest unit tests
4. `migration-naming` — Validates that all migration files follow the `YYYYMMDD_NNN_description.sql` naming convention

Vercel automatically deploys:
- Preview deployments on PR open / push
- Production deployment on merge to `main`

## Migration Discipline

Database migrations run in numeric order. Each migration file must:

1. Be named `YYYYMMDD_NNN_description.sql` (validated by CI)
2. Use `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` (idempotent)
3. Be tested in a local Supabase instance before merging
4. Never modify or delete a previously committed migration — add a new one instead

To run migrations locally:
```sh
pnpm db:migrate
```

To reset the local DB (destructive):
```sh
pnpm db:reset
```

To regenerate TypeScript types from the DB schema:
```sh
pnpm db:types
```

## Environment Variables

All required environment variables are documented in `.env.example`. Before deploying to a new environment:

1. Copy `.env.example` to the target environment's secret store (Vercel env vars)
2. Fill in all values
3. Never commit `.env*` files — they are in `.gitignore`

## Rollback

If a production deployment introduces a critical bug:

1. Revert the merge commit on `main` using `git revert` (creates a new commit, does not force-push)
2. Push the revert — Vercel automatically deploys the reverted state
3. If a DB migration was included and is causing issues, write a new corrective migration — never edit committed migration files

There is no automated database rollback. Migration rollbacks are manual and must be carefully coordinated with the team.
