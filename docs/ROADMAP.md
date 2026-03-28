# Roadmap

## Phase 1 — Foundation (Launch)

**Goal**: A safe, working product for the World Labs hackathon and initial NYC users.

**Deliverables:**
- User registration with OAuth (Google + Apple), DOB collection, parental consent flow for minors
- Daily scripture feed with optional TTS narration
- Community post feed (4 post types, all_ages + adults_only audiences, moderation queue)
- Move surface (4 workout plan types, completion logging, streaks)
- You profile (badges, post count, streak display, notification settings)
- Rooms UI placeholder (Phase 2 preview, no voice functionality)
- Full four-layer age enforcement (DB triggers + RLS + service layer + API handlers)
- Staff moderation dashboard (pending flags queue, resolve/action)
- GitHub Actions CI (lint, typecheck, test, migration naming)
- Age policy guard workflow

**Exit Criteria:**
- All CI checks pass on `main`
- Zero `any` types in TypeScript
- Minor account cannot access adults_only content via any known path
- Moderation queue works end-to-end for post approval/removal
- Parental consent flow works for new minor registrations

---

## Phase 2 — Voice Rooms

**Goal**: Launch live faith-centered voice rooms with full minor safety.

**Prerequisites (all required):**
1. Staff moderation tooling is live and actively staffed
2. Minor voice safety pipeline validated (internal testing + safety review sign-off)
3. LiveKit integration security-reviewed and tested in staging

**Deliverables:**
- LiveKit integration (`services/voice/index.ts` fully implemented)
- Room creation flow for young_adult users
- Real-time moderator presence validation
- Automatic room closure when last moderator leaves a minor-present room
- Minor listener-only enforcement in voice
- Move surface AI narration via World Labs / ElevenLabs

**Exit Criteria:**
- A minor cannot join a room without an active moderator (tested end-to-end)
- A minor cannot speak in a room without moderator promotion
- Room closure cascade works when moderator count reaches zero with minor present

---

## Phase 3 — AI Companions + World Labs Spatial

**Goal**: Introduce contextual, faith-aware AI features and spatial experiences — safely.

**Deliverables (tentative):**
- [ ] World Labs Prayer Room (all users)
- [ ] World Labs Identity Journey (chapter 1 launch, 2-5 rolling)
- [ ] World Labs Community Campfire (adults only at launch)
- [ ] Wayfinder badge system
- AI wellness check-in companion (text, not voice — bounded conversation)
- Personalized scripture recommendations based on recent posts (opt-in)
- AI-assisted post prompts (suggestion only, user writes the post)
- DM system (young_adults only at launch)

**Constraints:**
- No AI features for minor users until a separate age-appropriate safety review
- All AI interactions logged and auditable
- No behavioral advertising or dark pattern use of AI-generated insights
- Crisis detection must remain live (Perspective API self-harm scoring)

---

## Phase 4 — Scale

**Goal**: Expand beyond NYC, grow the team, formalize infrastructure.

**Deliverables (tentative):**
- Geographic expansion (other cities)
- Terraform-managed infrastructure
- Dedicated API service (`apps/api/`)
- Rate limiting (Upstash Redis or equivalent)
- Push notifications (FCM / APNs)
- Age-tier update job (auto-upgrade minor → young_adult on 18th birthday)
- Analytics pipeline (privacy-preserving, no behavioral targeting)
