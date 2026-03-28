# Product Model

## Mission

Diiff exists to help young people (ages 16–25) in New York City build healthy, faith-rooted lives — through movement, community, and spiritual grounding.

The name "Diiff" reflects the idea of *differentiation*: standing apart from social media that extracts attention, and instead offering a space that returns something meaningful.

## Core Loop

```
Daily Scripture  →  Reflection  →  Move  →  Share  →  Community
     (Spirit)                   (Body)    (Feed)     (Rooms)
```

Each day, a user receives a curated scripture passage. They reflect. They move — a short, faith-tagged workout. They optionally share their experience as a post. They connect with others in rooms.

This loop is designed to be completable in 20–30 minutes. Diiff does not reward infinite scroll.

## Four Surfaces

### 1. Spirit (Daily Scripture + TTS)
- One curated Bible verse per day, date-seeded so all users see the same verse
- Optional audio narration via ElevenLabs (server-side TTS, scripted text only — never user audio)
- Fallback to silent text if TTS fails

### 2. Move (Workout Plans)
- Four plan types: cardio, strength, flexibility, breathwork
- Each plan includes a scripture reference
- Users log completions; streaks are tracked per user per type
- World Labs AI narration is planned for Phase 2

### 3. Feed (Community Posts)
- Post types: spirit, move, community, wellness
- All posts go through moderation before appearing (`pending` → `approved`)
- Minors see only `all_ages` content; `adults_only` content is age-gated at all four enforcement layers
- Feed is chronological — no algorithmic ranking (required by NY SAFE for Kids Act for minor users)
- Reactions (likes) and comments supported

### 4. Rooms (Voice + Community) — Phase 2
- Faith-centered group conversation
- Two room types: `all_ages_moderated` and `adults_only`
- Minor users can only join `all_ages_moderated` rooms with an active moderator present
- Voice infrastructure is deferred until moderation tooling and safety validation are complete
- See `docs/VOICE_SYSTEM.md` for planned architecture

## Launch Non-Goals

The following are explicitly **not** in scope at launch:

- Direct messages (DMs) between users
- Algorithmic feed ranking or recommendation engine
- Push notifications (notifications are in-app only at launch)
- Video content or live streaming
- Monetization, subscriptions, or in-app purchases
- Voice rooms (Phase 2 — see `services/voice/index.ts`)
- Conversational AI / chatbot features (Phase 3)
- Non-NYC geographic expansion

## Growth Philosophy

Diiff grows by being genuinely useful to its initial users, not by optimizing engagement metrics. The goal is not daily active users — it is daily meaningful moments.

Features will be added only when the safety and moderation infrastructure for that feature is validated. See `docs/ROADMAP.md` for the phase plan.
