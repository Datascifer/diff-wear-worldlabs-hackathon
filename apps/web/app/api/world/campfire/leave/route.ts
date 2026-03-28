import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertAuthenticated, resolveAgeTier } from "../../../../../../../services/auth";
import { leaveCampfire } from "../../../../../../../services/world-labs/campfire";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const user = await assertAuthenticated(supabase);
  const ageTier = await resolveAgeTier(user.id, supabase);

  if (ageTier !== "young_adult") {
    return NextResponse.json(
      { data: null, error: "Campfire is only available to users age 18+." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as { sessionId?: string };
  if (!body.sessionId) {
    return NextResponse.json({ data: null, error: "sessionId is required" }, { status: 422 });
  }

  await leaveCampfire(body.sessionId, user.id, supabase);
  return NextResponse.json({ data: { ok: true }, error: null });
}
