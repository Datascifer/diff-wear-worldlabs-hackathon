import type { AgeTier, UserCapabilities } from "../../apps/web/types/domain";

export const MINOR_CAPABILITIES: UserCapabilities = {
  canCreateRoom: false,
  canJoinUnmoderatedRoom: false,
  canViewAdultContent: false,
  canUseConversationalAI: false,
  canSendDMs: false,
} as const;

export const YOUNG_ADULT_CAPABILITIES: UserCapabilities = {
  canCreateRoom: true,
  canJoinUnmoderatedRoom: false,  // Phase 2
  canViewAdultContent: true,
  canUseConversationalAI: false,  // Phase 2
  canSendDMs: false,              // Phase 3
} as const;

export function getCapabilities(ageTier: AgeTier): UserCapabilities {
  if (ageTier === "minor") return MINOR_CAPABILITIES;
  return YOUNG_ADULT_CAPABILITIES;
}
