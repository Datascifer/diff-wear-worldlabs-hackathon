import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { ApiResult, AgeTier } from "@/types/domain";
import { getCapabilities } from "@/lib/utils/capabilities";

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

  // 2. Resolve age tier from DB
  const { data: profile } = await supabase
    .from("users")
    .select("age_tier")
    .eq("id", user.id)
    .single();

  const isMinor = profile?.age_tier === "minor";

  let query = supabase
    .from("rooms")
    .select(
      "id, title, topic, room_type, status, opened_at, creator:users(display_name)"
    )
    .in("status", ["scheduled", "live"])
    .order("created_at", { ascending: false });

  // 3. Minor sessions see only all_ages_moderated rooms
  if (isMinor) {
    query = query.eq("room_type", "all_ages_moderated");
  }

  const { data: rooms, error } = await query;

  if (error) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Failed to fetch rooms." } },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResult<typeof rooms>>({
    success: true,
    data: rooms,
  });
}

export async function POST(request: NextRequest) {
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

  // 2. Resolve age tier and account status from DB
  const { data: profile } = await supabase
    .from("users")
    .select("age_tier, account_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.account_status !== "active") {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "ACCOUNT_INACTIVE", message: "Account is not active." } },
      { status: 403 }
    );
  }

  // 3. Capability check — only young_adults can create rooms
  const capabilities = getCapabilities(profile.age_tier as AgeTier);
  if (!capabilities.canCreateRoom) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "MINOR_CANNOT_CREATE_ROOM", message: "Minors cannot create rooms." } },
      { status: 403 }
    );
  }

  const body = (await request.json()) as {
    title?: string;
    topic?: string;
    room_type?: string;
  };

  if (!body.title || body.title.trim().length === 0) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "INVALID_INPUT", message: "Room title is required." } },
      { status: 422 }
    );
  }

  const validRoomTypes = ["all_ages_moderated", "adults_only"];
  const roomType =
    body.room_type && validRoomTypes.includes(body.room_type)
      ? body.room_type
      : "all_ages_moderated";

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      creator_id: user.id,
      title: body.title.trim().substring(0, 100),
      topic: body.topic?.trim().substring(0, 200) ?? null,
      room_type: roomType,
      status: "scheduled",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Failed to create room." } },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResult<typeof room>>(
    { success: true, data: room },
    { status: 201 }
  );
}
