# Voice System

**Status: Phase 2 — Not yet implemented.**

The voice service module at `services/voice/index.ts` exports nothing but an empty module. Voice rooms must not be built until all prerequisites below are satisfied.

## Prerequisites (all required before Phase 2 begins)

1. **Staff moderation tooling complete** — The full `moderation_flags` pipeline must be live in production and actively staffed. Moderators must be able to monitor, flag, and remove room participants in real time.
2. **Minor voice safety pipeline validated** — The real-time audio moderation path must be tested with internal users and signed off by a safety review. This includes latency budgets for moderation decisions during live audio.
3. **LiveKit integration selected, security-reviewed, and tested in staging** — The WebRTC provider must be confirmed. A security review of token issuance, room permissions, and recording policies must be completed and documented.

## Planned Architecture

When Phase 2 begins, `services/voice/index.ts` will export:

```typescript
createRoom(params: CreateRoomParams): Promise<LiveKitRoom>
joinRoom(roomId: string, userId: string, role: RoomRole): Promise<LiveKitToken>
closeRoom(roomId: string): Promise<void>
validateModeratorPresence(roomId: string): Promise<boolean>
```

## Room Types

| Type | Who Can Join | Moderation Requirement |
|------|-------------|----------------------|
| `all_ages_moderated` | minors + young adults | Active moderator required at all times |
| `adults_only` | young adults only (18–25) | Moderation recommended but not enforced at DB level |

## Minor Safety Rules in Voice

1. A minor cannot join an `all_ages_moderated` room unless at least one `room_moderators` row for that room has `is_active = true`.
2. If the last active moderator leaves a room while a minor is present, the room must be automatically closed or the minor must be removed.
3. Minors cannot speak (role = `speaker`) in any room without explicit moderator promotion.
4. No recording or storage of audio from any session where a minor is present.

## Data Model (planned)

The DB schema for rooms is already live (`db/migrations/20250901_004_create_rooms.sql`):

- `rooms` — room metadata, type, status
- `room_participants` — join records with role (listener / speaker / moderator)
- `room_moderators` — assigned moderators with `is_active` flag

LiveKit room tokens will be issued server-side only, scoped to the user's role in the room.

## Token Issuance Policy (planned)

- Tokens issued by a server-side Route Handler (`/api/rooms/[id]/token`)
- Token lifetime: 2 hours maximum
- Token scope: single room, single user, role from DB
- Minor users: issued listener-role tokens only, cannot self-promote
- Token revocation: room close event triggers server-side revoke call to LiveKit API
