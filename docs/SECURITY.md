# Security

## Authentication

- OAuth-only: Google and Apple. No passwords are ever stored or accepted.
- Session validation uses `supabase.auth.getUser()` exclusively. `getSession()` is forbidden in server code because it reads the cookie without re-validating with the auth server.
- JWT claims are not trusted for age or role information. `age_tier` and `is_staff` are always read from the database row.
- The `middleware.ts` refresh loop keeps sessions valid on every request to protected routes.

## Transport

- All traffic is HTTPS. HTTP is not supported.
- Security headers are set in `next.config.ts`:
  - `X-Frame-Options: DENY` — prevents clickjacking
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Content-Security-Policy` — restricts script/style/image/connect sources
- `maximumScale: 1` in viewport meta prevents iOS auto-zoom (UX, not security)

## Data Protection

- `date_of_birth` is never included in API responses. It is stored in the DB and used only for age computation.
- `age_tier` is server-computed and never accepted from any client input.
- `is_staff` is set only via the Supabase dashboard. No API endpoint accepts or modifies this field.
- User passwords: not applicable (OAuth-only).
- Supabase Storage URLs for `avatar_url` and `media_url` are served through Supabase's CDN, not directly from S3. Signed URLs are used for private assets.

## Row-Level Security

RLS is enabled on all public tables. The canonical policies are in `db/policies/`. Key design decisions:

- Age-tier checks in RLS use `caller_is_minor()` / `caller_is_young_adult()` helper functions that read from `public.users.age_tier`, not from JWT claims.
- `moderation_flags` has no DELETE policy and DELETE is revoked at the DB level — the table is immutable.
- `is_staff` gating in RLS reads the DB row, not the JWT.

## Secrets

All secrets are stored in environment variables, never in code or committed files. See `.env.example` for the full list of required variables.

Required secrets:
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS. Never exposed to the client. Used only in `createServiceClient()` for background jobs.
- `ELEVENLABS_API_KEY` — server-side only
- `PERSPECTIVE_API_KEY` — server-side only

The `NEXT_PUBLIC_` prefix is used only for the Supabase URL and anon key — these are safe to expose to the browser (RLS enforces access control).

## Abuse Prevention

- **Rate limiting**: Not yet implemented at launch. Vercel's platform-level rate limiting provides basic protection. A dedicated rate-limiting layer (e.g., Upstash Redis) is planned for Phase 2.
- **Minor content access**: Four independent enforcement layers (DB triggers, RLS, service layer, API handlers) prevent minors from accessing adults-only content even if one layer is bypassed.
- **Account enumeration**: Auth errors return generic messages. The OAuth flow does not reveal whether an email is registered.
- **CSRF**: Next.js Route Handlers are not vulnerable to CSRF for JSON endpoints (Content-Type check). The Supabase SSR cookie is `httpOnly` and `sameSite: lax`.
- **Input validation**: Content length limits are enforced at DB constraint level, API handler level, and UI level. SQL injection is not possible via Supabase's parameterized query API.
