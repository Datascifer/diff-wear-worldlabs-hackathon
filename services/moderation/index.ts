import type { SupabaseClient } from "@supabase/supabase-js";
import { analyzeText } from "./classifier";
import type {
  AgeTier,
  FlagCategory,
  FlagSeverity,
  FlagSource,
  FlagOutcome,
  ModerationFlag,
} from "../../apps/web/types/domain";

// Thresholds are named constants — not magic numbers.
// Minor content is held to a stricter standard.
const TOXICITY_THRESHOLD_ADULT = 0.80;
const TOXICITY_THRESHOLD_MINOR = 0.60;
const THREAT_THRESHOLD = 0.70;
const SEXUAL_THRESHOLD_ADULT = 0.85;
const SEXUAL_THRESHOLD_MINOR = 0.50;
const IDENTITY_ATTACK_THRESHOLD = 0.75;
// Sentinel value returned by classifier.ts on API failure
const FAIL_OPEN_SENTINEL = -1;

export interface ClassificationResult {
  allowed: boolean;
  reason?: string;
  requiresReview?: boolean;
}

export interface CreateFlagInput {
  targetType: ModerationFlag["target_type"];
  targetId: string;
  flagSource: FlagSource;
  category: FlagCategory;
  severity: FlagSeverity;
  reporterId?: string;
}

export async function classifyText(
  text: string,
  ageTier: AgeTier
): Promise<ClassificationResult> {
  const scores = await analyzeText(text);

  // Fail-open: API error → flag for manual review, allow post through
  if (scores.toxicity === FAIL_OPEN_SENTINEL) {
    return { allowed: true, requiresReview: true };
  }

  const toxicityThreshold =
    ageTier === "minor" ? TOXICITY_THRESHOLD_MINOR : TOXICITY_THRESHOLD_ADULT;
  const sexualThreshold =
    ageTier === "minor" ? SEXUAL_THRESHOLD_MINOR : SEXUAL_THRESHOLD_ADULT;

  if (scores.toxicity >= toxicityThreshold) {
    return { allowed: false, reason: "Content contains toxic language." };
  }
  if (scores.threat >= THREAT_THRESHOLD) {
    return { allowed: false, reason: "Content contains threatening language." };
  }
  if (scores.sexuallyExplicit >= sexualThreshold) {
    return { allowed: false, reason: "Content contains explicit material." };
  }
  if (scores.identityAttack >= IDENTITY_ATTACK_THRESHOLD) {
    return {
      allowed: false,
      reason: "Content contains identity-based attacks.",
    };
  }

  return { allowed: true };
}

export async function flagContent(
  input: CreateFlagInput,
  supabase: SupabaseClient
): Promise<ModerationFlag> {
  const { data, error } = await supabase
    .from("moderation_flags")
    .insert({
      target_type: input.targetType,
      target_id: input.targetId,
      flag_source: input.flagSource,
      category: input.category,
      severity: input.severity,
      reporter_id: input.reporterId ?? null,
      outcome: "pending",
    })
    .select()
    .single();

  if (error ?? !data) {
    throw new Error(
      `Failed to create moderation flag: ${error?.message ?? "unknown error"}`
    );
  }

  return data as ModerationFlag;
}

export async function getPendingFlags(
  supabase: SupabaseClient
): Promise<ModerationFlag[]> {
  const { data, error } = await supabase
    .from("moderation_flags")
    .select("*")
    .eq("outcome", "pending")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch pending flags: ${error.message}`);
  }

  return (data ?? []) as ModerationFlag[];
}

export async function resolveFlag(
  flagId: string,
  outcome: FlagOutcome,
  reviewerId: string,
  notes: string,
  supabase: SupabaseClient
): Promise<void> {
  const { error } = await supabase
    .from("moderation_flags")
    .update({ reviewer_id: reviewerId, outcome, notes })
    .eq("id", flagId);

  if (error) {
    throw new Error(`Failed to resolve flag ${flagId}: ${error.message}`);
  }
}
