import { classifyText } from "../moderation";
import type { AgeTier } from "../../apps/web/types/domain";

export interface ModerationGateResult {
  allowed: boolean;
  reason?: string;
}

// Screen content before publication.
// Returns { allowed: false, reason } to prevent post creation.
// Fail-open: if classification service errors, content is allowed but flagged for review.
export async function screenContent(
  content: string,
  ageTier: AgeTier
): Promise<ModerationGateResult> {
  const result = await classifyText(content, ageTier);

  if (!result.allowed) {
    return { allowed: false, reason: result.reason };
  }

  return { allowed: true };
}
