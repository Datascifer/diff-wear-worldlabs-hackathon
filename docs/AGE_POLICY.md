# Age Policy

This document is the authoritative specification for how Diiff determines and enforces user age tiers. All engineers, AI coding assistants, and reviewers must read this before touching any authentication, content, or room code.

## Definitions

| Term | Definition |
|------|-----------|
| `minor` | A user whose computed age is 16 or 17 at the time of access |
| `young_adult` | A user whose computed age is 18–25 at the time of access |
| `age_tier` | The server-computed classification stored in `public.users.age_tier` |
| `date_of_birth` | The user-provided birthdate, stored in `public.users.date_of_birth` |

## Age Determination — 5-Step Process

1. **User provides `date_of_birth`** during registration (required field, not editable after account creation without staff intervention).
2. **Server validates eligibility**: age must be ≥ 16 and ≤ 25. Users outside this range are rejected with a clear message.
3. **Server computes `age_tier`** using `computeAgeTier(dateOfBirth)` in `apps/web/lib/utils/age.ts`. This function handles birthday edge cases (leap years, time zones) by computing the full age in years.
4. **`age_tier` is stored** in `public.users.age_tier` at registration via `computeAndStoreAgeTier()` in `services/auth/index.ts`.
5. **On a user's 18th birthday**, a scheduled job (future Phase 2) updates `age_tier` from `minor` to `young_adult`. Until then, RLS helper functions re-read `age_tier` from the DB row on every request.

## What is NEVER Allowed

- Accepting `age_tier` from any client input (form, API body, JWT claim)
- Reading `age_tier` from the JWT — it must always come from the DB row
- Storing the raw `date_of_birth` in any API response or client-readable field
- Computing age in the browser — all age logic runs server-side only

## Capability Matrix

| Capability | `minor` (16–17) | `young_adult` (18–25) |
|-----------|:--------------:|:-------------------:|
| View `all_ages` posts | ✓ | ✓ |
| View `adults_only` posts | ✗ | ✓ |
| Create `all_ages` posts | ✓ | ✓ |
| Create `adults_only` posts | ✗ | ✓ |
| Create rooms | ✗ | ✓ |
| Join `all_ages_moderated` rooms (with active moderator) | ✓ | ✓ |
| Join `adults_only` rooms | ✗ | ✓ |
| Join rooms without active moderator | ✗ | ✓ |
| Conversational AI | ✗ (Phase 3) | ✗ (Phase 3) |
| Direct messages | ✗ (Phase 3) | ✗ (Phase 3) |

## Enforcement Layers

Age enforcement is implemented at **four independent layers**. A bypass at any single layer does not grant access — all layers must pass.

1. **Database triggers** — `enforce_minor_audience`, `enforce_room_creator_age`, `enforce_participant_safety` raise `check_violation` exceptions that abort the transaction.
2. **Row-Level Security** — `caller_is_minor()`, `caller_is_young_adult()`, `can_join_room()` helper functions read `age_tier` from the DB row and gate SELECT/INSERT/UPDATE policies.
3. **Service layer** — `getCapabilities(ageTier)` and `assertCapability()` in `apps/web/lib/utils/capabilities.ts` enforce capabilities before any DB mutation.
4. **API route handlers** — Every route handler resolves `age_tier` from the DB via `resolveAgeTier()` before processing any request that depends on age.

## Parental Consent

Users who are 16 or 17 at registration are placed in `account_status = 'pending_consent'` until a parent or guardian verifies via the email flow initiated at `/register/age-gate`. The `parental_consent_at` timestamp is recorded when consent is granted.

Minors with `account_status = 'pending_consent'` cannot post, react, or join rooms. They may browse `all_ages` approved content in read-only mode.

## Regulatory Context

Diiff operates under:

- **New York SAFE for Kids Act** — requires chronological feeds (no algorithmic ranking) for minors and parental consent for users under 18. Implemented via: no ranking algorithm, `created_at DESC` ordering for minor feeds, and the parental consent flow.
- **COPPA** — Diiff does not permit users under 16. Age validation at registration enforces this hard floor.
- **General best practices** — No behavioral advertising, no dark patterns in consent flows, honest disclosure of data practices to parents.

## Changes to This Policy

Any PR that modifies `AGE_POLICY.md`, any RLS policy file, or any file in `apps/web/lib/utils/age.ts` or `apps/web/lib/utils/capabilities.ts` will trigger the `age-policy-guard` GitHub Actions workflow, which posts a mandatory review comment on the PR.

Changes to age enforcement logic require review by at least one additional team member beyond the author.
