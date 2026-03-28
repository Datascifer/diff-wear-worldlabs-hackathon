import type { SupabaseClient } from "@supabase/supabase-js";

export interface ModerationAction {
  type: "warn" | "mute" | "remove" | "close_session";
  targetUserId?: string;
  sessionId: string;
  reason: string;
  moderatorId: string;
}

export async function applyModerationAction(
  action: ModerationAction,
  supabase: SupabaseClient
): Promise<void> {
  const { error: flagError } = await supabase.from("moderation_flags").insert({
    target_type: "room",
    target_id: action.sessionId,
    flag_source: "user_report",
    category: "other",
    severity: "medium",
    reporter_id: action.moderatorId,
    reviewer_id: action.moderatorId,
    outcome: "pending",
    notes: `campfire:${action.type}:${action.reason}${
      action.targetUserId ? `:target=${action.targetUserId}` : ""
    }`,
  });

  if (flagError) throw flagError;

  if (action.type === "close_session") {
    const { error: closeError } = await supabase
      .from("campfire_sessions")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", action.sessionId)
      .eq("status", "live");

    if (closeError) throw closeError;
  }

  // LIVEKIT_INTEGRATION: apply mute/remove operations via livekit-server-sdk.
  // ASSEMBLYAI/HIVE_INTEGRATION: connect streaming transcript/safety signals.
}
