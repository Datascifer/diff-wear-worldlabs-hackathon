# AGENTS.md — Repository Rules for AI Coding Assistants

This file is always loaded into context for AI coding sessions in this repository. Read it before making any changes.

## What This Project Is

Diiff is a faith-centered wellness platform for users ages 16–25 in New York City. The platform hosts minors (ages 16–17). **Age safety is the first-class constraint in this codebase.** When in doubt, err toward protection.

## Mandatory Reading

Before touching any of these files, read the linked document:

| File(s) | Read First |
|---------|-----------|
| `apps/web/lib/utils/age.ts` | `docs/AGE_POLICY.md` |
| `apps/web/lib/utils/capabilities.ts` | `docs/AGE_POLICY.md` |
| `services/auth/**` | `docs/AGE_POLICY.md` |
| `db/policies/**` | `docs/AGE_POLICY.md` + `docs/ARCHITECTURE.md` |
| `db/migrations/**` | `docs/DATA_MODEL.md` |
| `services/moderation/**` | `docs/MODERATION.md` |
| `services/voice/**` | `docs/VOICE_SYSTEM.md` |

## Absolute Rules — Never Violate

1. **Never accept `age_tier` from client input.** It is server-computed from `date_of_birth` only. If you see code that reads `age_tier` from a request body, form field, or JWT claim, it is a bug.

2. **Never call `supabase.auth.getSession()` in server-side code.** Always use `supabase.auth.getUser()`. `getSession()` reads from the cookie without re-validating — it is spoofable.

3. **Never add a DELETE policy or grant DELETE on `moderation_flags`.** This table is append-only. If you see a DELETE being added, it is wrong.

4. **Never implement voice features in `services/voice/index.ts`.** It must remain `export {}` until all prerequisites in `docs/VOICE_SYSTEM.md` are met and a human engineer has explicitly authorized Phase 2.

5. **Never set `is_staff = true` via an API route.** Staff status is set only through the Supabase dashboard. Any API endpoint that accepts `is_staff` is a security vulnerability.

6. **Never expose `date_of_birth` in API responses.** It must stay server-side only.

7. **Never remove a DB migration file or edit a committed migration.** Add a new migration instead.

## Age Enforcement — Four Layers

When implementing any feature that touches content visibility, room access, or user capabilities, enforce at all four layers:

1. **DB trigger** — Add a trigger if a hard constraint needs to be enforced at the database transaction level
2. **RLS policy** — Update `db/policies/` to gate SELECT/INSERT/UPDATE appropriately
3. **Service function** — Use `getCapabilities(ageTier)` and `assertCapability()` before mutations
4. **API route handler** — Call `resolveAgeTier(supabase, userId)` from `services/auth`, check capabilities before processing

Missing one layer is a safety gap. All four must be consistent.

## TypeScript Rules

This project uses TypeScript strict mode with:
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `noImplicitOverride: true`

Do not use `any`. Do not suppress TypeScript errors with `// @ts-ignore` or `// @ts-expect-error` without a detailed comment explaining why.

ESLint rules:
- `@typescript-eslint/no-explicit-any: error` — no exceptions
- `@typescript-eslint/no-floating-promises: error` — always await or `.catch()` promises
- `no-console: warn` — use structured logging in services, not `console.log`

## Session Validation

```typescript
// CORRECT — always use getUser() in server code
const { data: { user }, error } = await supabase.auth.getUser();

// WRONG — getSession() is not safe for server-side auth checks
const { data: { session } } = await supabase.auth.getSession(); // NEVER
```

## Adding a New Feature Checklist

- [ ] Read `docs/ARCHITECTURE.md` request flow
- [ ] If the feature involves content or room access: verify all four age enforcement layers
- [ ] If modifying `age.ts`, `capabilities.ts`, or any RLS policy: read `docs/AGE_POLICY.md` first
- [ ] No `any` types
- [ ] No `getSession()` calls
- [ ] All promises awaited or caught
- [ ] DB migrations use `IF NOT EXISTS` (idempotent)
- [ ] Migration filenames follow `YYYYMMDD_NNN_description.sql`
