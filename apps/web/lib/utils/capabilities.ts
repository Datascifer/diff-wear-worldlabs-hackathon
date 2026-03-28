import type { AgeTier, UserCapabilities } from "@/types/domain";
import { CapabilityError } from "@/types/domain";

const MINOR_CAPABILITIES: UserCapabilities = {
  canCreateRoom: false,
  canJoinUnmoderatedRoom: false,
  canViewAdultContent: false,
  canUseConversationalAI: false,
  canSendDMs: false,
} as const;

const YOUNG_ADULT_CAPABILITIES: UserCapabilities = {
  canCreateRoom: true,
  canJoinUnmoderatedRoom: false, // Phase 2
  canViewAdultContent: true,
  canUseConversationalAI: false, // Phase 2
  canSendDMs: false,             // Phase 3
} as const;

export function getCapabilities(ageTier: AgeTier): UserCapabilities {
  if (ageTier === "minor") return MINOR_CAPABILITIES;
  return YOUNG_ADULT_CAPABILITIES;
}

export function assertCapability(
  capabilities: UserCapabilities,
  capability: keyof UserCapabilities
): void {
  if (!capabilities[capability]) {
    throw new CapabilityError(capability);
  }
}
