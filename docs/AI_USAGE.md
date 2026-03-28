# AI Usage Policy

This document defines how AI capabilities are used within Diiff and what is explicitly prohibited.

## Approved Uses

| Use | Implementation | Notes |
|-----|---------------|-------|
| Daily scripture TTS narration | ElevenLabs, server-side only | Scripted text only — the verse text itself. No user-generated text ever sent to TTS. |
| Workout narration | ElevenLabs, server-side only | 4 static narration scripts, one per plan type. Not personalized. |
| Text moderation | Google Perspective API | Screens post and comment content before approval. Fail-open (if API is unavailable, content proceeds to human review). |
| Daily scripture rotation | Date-seeded deterministic selection | No model inference — pure date math over a curated list. |

## Explicitly Disallowed Uses

- Sending any user-generated text to a TTS provider (user posts, comments, DMs)
- Sending any identifying user information (name, DOB, location) to any third-party AI service
- Generating personalized content recommendations using user behavior data
- Any form of conversational AI / chatbot features (Phase 3 consideration, not approved)
- Automated content generation for posts, comments, or scripture text
- Using AI to infer or predict a user's age, mood, health status, or beliefs

## Perspective API Usage

The Perspective API is used to score post and comment content for toxicity before it becomes visible to other users.

**Key behaviors:**
- All requests have a 3-second timeout with `AbortController`
- If the API call fails (timeout, error, rate limit), the classifier returns sentinel scores of `-1` and the content proceeds to the human moderation queue — it does not get auto-rejected
- Thresholds differ by audience:
  - `all_ages` content: `TOXICITY_THRESHOLD = 0.60`
  - `adults_only` content: `TOXICITY_THRESHOLD = 0.80`
  - Sexual content threshold for any minor-accessible content: `0.50`
- Raw Perspective API scores are stored in `moderation_flags.scores` (JSONB) for audit purposes
- Scores are never shown to end users

## ElevenLabs Usage

ElevenLabs is used exclusively for server-side audio synthesis of pre-approved text.

**Key behaviors:**
- API key validated at call time, not at module load
- In production, a missing API key throws immediately (no silent fallback)
- In development, returns `null` to avoid requiring a key for local work
- The returned audio is base64-encoded and served as a data URL — no audio files are stored in Supabase Storage
- No user audio is ever recorded, transcribed, or sent to any service

## Crisis Resources

If any content submitted by a user indicates potential self-harm, crisis, or abuse, the moderation team follows this protocol:

1. The content is auto-flagged at `SELF_HARM_THRESHOLD = 0.70` via the Perspective API `SELF_HARM` attribute
2. Staff are notified via the moderation dashboard
3. Staff do not respond to the user directly in-platform — they follow the escalation protocol documented in the internal staff handbook
4. NYC crisis resources are displayed in-app to all users in the You section:
   - **Crisis Text Line**: Text HOME to 741741
   - **NYC Well**: 1-888-NYC-WELL (1-888-692-9355)
   - **The Trevor Project** (LGBTQ+ youth): 1-866-488-7386

These resources are static UI, not AI-generated.
