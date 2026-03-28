import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgeTier } from "../../apps/web/types/domain";

export const AVATAR_COLORS = [
  "#7B2FFF",
  "#0057FF",
  "#FF6B00",
  "#00C87A",
  "#FFD600",
  "#FF3CAC",
  "#FF1744",
  "#3D00C8",
] as const;

export async function joinCampfire(
  sessionId: string,
  userId: string,
  ageTier: AgeTier,
  supabase: SupabaseClient
): Promise<{ liveKitToken: string; avatarColor: string }> {
  if (ageTier !== "young_adult") {
    throw new Error(
      "MINOR_CAMPFIRE_BLOCKED: Campfire is not available for users under 18."
    );
  }

  const colorIndex = userId.charCodeAt(0) % AVATAR_COLORS.length;
  const avatarColor = AVATAR_COLORS[colorIndex] ?? AVATAR_COLORS[0];

  const { error } = await supabase
    .from("campfire_participants")
    .insert({ session_id: sessionId, user_id: userId, avatar_color: avatarColor });

  if (error) {
    if (error.message.includes("capacity")) throw new Error("CAMPFIRE_FULL");
    throw error;
  }

  const liveKitToken = "LIVEKIT_TOKEN_PLACEHOLDER";
  return { liveKitToken, avatarColor };
}

export async function leaveCampfire(
  sessionId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  const { error } = await supabase
    .from("campfire_participants")
    .update({ left_at: new Date().toISOString() })
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .is("left_at", null);

  if (error) throw error;
}

export async function getLiveParticipantCount(
  sessionId: string,
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from("campfire_participants")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .is("left_at", null);

  if (error) throw error;
  return count ?? 0;
}
