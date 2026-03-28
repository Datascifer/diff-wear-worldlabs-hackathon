# Decision Log

Architectural Decision Records (ADRs) for Diiff. Each entry records a significant technical or product decision, why it was made, and what alternatives were considered.

---

## ADR-001: OAuth-Only Authentication (No Passwords)

**Date**: 2025-09-01
**Status**: Accepted

**Decision**: Users authenticate exclusively via Google or Apple OAuth. No password registration or email/password login.

**Rationale**:
- Eliminates credential storage risk (no password hashes, no reset flows)
- Reduces friction for the 16–25 demographic who universally have Google or Apple accounts
- Apple Sign In is required for App Store submission (future iOS app)
- No password recovery edge cases to design or test

**Alternatives considered**:
- Email/password with bcrypt — rejected due to operational complexity and credential risk
- Magic link email — rejected as an added dependency and unreliable for some school email domains

---

## ADR-002: Four-Layer Age Enforcement

**Date**: 2025-09-01
**Status**: Accepted

**Decision**: Age-gating logic is implemented independently at four layers: DB triggers, RLS policies, service functions, and API route handlers.

**Rationale**:
- Compliance with NY SAFE for Kids Act requires demonstrable, robust enforcement
- Defense-in-depth means a bug at any single layer does not expose minor users to adult content
- Each layer is independently testable

**Alternatives considered**:
- Single enforcement point (RLS only) — rejected as insufficient for compliance and brittle under schema changes
- JWT claims for age_tier — rejected because JWTs can be replayed or spoofed; DB row is authoritative

---

## ADR-003: Age Tier from DB Row, Never JWT Claims

**Date**: 2025-09-01
**Status**: Accepted

**Decision**: `age_tier` and `is_staff` are always read from `public.users` row in real time. JWT claims are explicitly not used for these values.

**Rationale**:
- JWTs have a lifespan; a user who turns 18 or whose staff status changes would retain stale claims until token expiry
- A user who forges or replays a JWT with a modified claim would bypass age enforcement if we trusted the JWT
- Reading from DB on every request adds one query but provides current, authoritative values

**Alternatives considered**:
- Storing age_tier in JWT claims with short expiry — rejected due to complexity and residual risk window
- Middleware-level caching of age_tier per session — rejected as premature optimization

---

## ADR-004: Append-Only Moderation Flags

**Date**: 2025-09-01
**Status**: Accepted

**Decision**: The `moderation_flags` table has DELETE revoked at the PostgreSQL role level and no RLS DELETE policy. Flags can only be appended and their status updated.

**Rationale**:
- Provides a tamper-evident audit trail for all moderation decisions
- Required for legal defensibility if a moderation action is challenged
- Protects against accidental or malicious deletion of evidence

**Alternatives considered**:
- Soft delete (is_deleted column) — rejected because rows could still be hidden from audits by staff with UPDATE access
- External audit log — rejected as too complex for launch; DB-level protection is simpler and sufficient

---

## ADR-005: Monorepo with pnpm Workspaces

**Date**: 2025-09-01
**Status**: Accepted

**Decision**: All code lives in a single pnpm workspace monorepo with `apps/*` and `services/*` packages.

**Rationale**:
- Services (auth, feed, moderation, ai, voice) are shared between the web app and future services
- Single TypeScript config and ESLint config reduces inconsistency
- pnpm workspaces provide fast installs with a content-addressable store

**Alternatives considered**:
- Separate repos per service — rejected as too much overhead for a small team
- Nx monorepo — rejected as unnecessary complexity at this scale

---

## ADR-006: Chronological Feed for Minors

**Date**: 2025-09-01
**Status**: Accepted

**Decision**: The post feed for minor users is always ordered by `created_at DESC` with no algorithmic ranking, recommendation, or engagement weighting.

**Rationale**:
- Required by New York SAFE for Kids Act, which prohibits algorithmic amplification of content for minors without parental consent
- Also aligns with Diiff's product philosophy of not optimizing for engagement at the cost of user wellbeing

**Alternatives considered**:
- Engagement-ranked feed for all users — rejected due to regulatory requirement and product values
- Opt-in algorithmic feed for minors with consent — rejected as introducing too much complexity for launch

---

## ADR-007: Voice Rooms Deferred to Phase 2

**Date**: 2025-09-01
**Status**: Accepted

**Decision**: Voice room functionality is explicitly not implemented at launch. `services/voice/index.ts` exports nothing. The rooms UI shows a Phase 2 placeholder.

**Rationale**:
- Live audio with minor users requires real-time moderation infrastructure that is not ready at launch
- LiveKit has not been security-reviewed or tested in staging
- The product is more valuable with working core features than with broken or unsafe voice
- Safety requirements for minor voice participation (always-present moderator, no recording) require verified enforcement before launch

**Alternatives considered**:
- Launch with young_adult-only voice rooms — rejected because young_adults and minors share the platform; the distinction in the UI would be confusing and the safety infrastructure still isn't ready
- Launch without minor voice support but with young_adult voice — deferred; not worth the complexity at launch
