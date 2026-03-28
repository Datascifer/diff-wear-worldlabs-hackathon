import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { ApiResult } from "@/types/domain";

export async function GET(_request: NextRequest) {
  const supabase = createClient();

  // 1. Validate session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  // 2. Staff-only — check is_staff from DB
  const { data: profile } = await supabase
    .from("users")
    .select("is_staff")
    .eq("id", user.id)
    .single();

  if (!profile?.is_staff) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "FORBIDDEN", message: "Staff access required." } },
      { status: 403 }
    );
  }

  const { data: flags, error } = await supabase
    .from("moderation_flags")
    .select(
      "id, target_type, target_id, flag_source, category, severity, outcome, created_at, reporter:users!reporter_id(display_name)"
    )
    .eq("outcome", "pending")
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Failed to fetch moderation queue." } },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResult<typeof flags>>({
    success: true,
    data: flags,
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient();

  // 1. Validate session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  // 2. Staff-only
  const { data: profile } = await supabase
    .from("users")
    .select("is_staff")
    .eq("id", user.id)
    .single();

  if (!profile?.is_staff) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "FORBIDDEN", message: "Staff access required." } },
      { status: 403 }
    );
  }

  const body = (await request.json()) as {
    flagId?: string;
    outcome?: string;
    notes?: string;
  };

  const validOutcomes = ["approved", "removed", "warned", "escalated", "dismissed"];
  if (!body.flagId || !body.outcome || !validOutcomes.includes(body.outcome)) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "INVALID_INPUT", message: "flagId and valid outcome are required." } },
      { status: 422 }
    );
  }

  const { error } = await supabase
    .from("moderation_flags")
    .update({
      reviewer_id: user.id,
      outcome: body.outcome,
      notes: body.notes ?? null,
    })
    .eq("id", body.flagId);

  if (error) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Failed to update flag." } },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResult<{ updated: true }>>({
    success: true,
    data: { updated: true },
  });
}
