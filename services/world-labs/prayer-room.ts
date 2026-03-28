import type { SupabaseClient } from "@supabase/supabase-js";

export interface PrayerSessionStart {
  sessionId: string;
  startedAt: string;
}

export async function startPrayerSession(
  userId: string,
  supabase: SupabaseClient
): Promise<PrayerSessionStart> {
  return {
    sessionId: `${userId}-${Date.now()}`,
    startedAt: new Date().toISOString(),
  };
}

export async function endPrayerSession(
  userId: string,
  durationSeconds: number,
  scriptureRef: string | null,
  supabase: SupabaseClient
): Promise<void> {
  const sanitizedDuration = Number.isFinite(durationSeconds)
    ? Math.max(0, Math.floor(durationSeconds))
    : 0;

  const { error } = await supabase.from("prayer_sessions").insert({
    user_id: userId,
    duration_seconds: sanitizedDuration,
    scripture_ref: scriptureRef,
  });

  if (error) throw error;
}
