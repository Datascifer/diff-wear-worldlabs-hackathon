// PHASE 2 — Voice room service (LiveKit integration)
// This module is intentionally empty at launch.
// See docs/VOICE_SYSTEM.md for planned architecture.
//
// DO NOT implement voice features until:
// 1. Staff moderation tooling is complete (full moderation_flags pipeline in production)
// 2. Minor voice safety pipeline is validated (tested with internal users, safety review signed off)
// 3. LiveKit integration is selected, security-reviewed, and tested in staging
//
// When Phase 2 begins, this module will export:
//   createRoom(params): Promise<LiveKitRoom>
//   joinRoom(roomId, userId, role): Promise<LiveKitToken>
//   closeRoom(roomId): Promise<void>
//   validateModeratorPresence(roomId): Promise<boolean>
export {};
