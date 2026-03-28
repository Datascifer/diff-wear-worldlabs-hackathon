import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertAuthenticated } from "../../../../../../../services/auth";
import { endPrayerSession, startPrayerSession } from "../../../../../../../services/world-labs/prayer-room";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const user = await assertAuthenticated(supabase);

  const body = (await request.json()) as {
    action?: "start" | "end";
    durationSeconds?: number;
    scriptureRef?: string;
  };

  if (body.action === "start") {
    const started = await startPrayerSession(user.id, supabase);
    return NextResponse.json({ data: started, error: null });
  }

  const durationSeconds = Number(body.durationSeconds ?? 0);
  await endPrayerSession(user.id, durationSeconds, body.scriptureRef ?? null, supabase);
  return NextResponse.json({ data: { ok: true }, error: null });
}
