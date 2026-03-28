import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { ApiResult } from "@/types/domain";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  // Toggle: remove if exists, add if not
  const { data: existing } = await supabase
    .from("post_reactions")
    .select("id")
    .eq("post_id", params.id)
    .eq("user_id", user.id)
    .eq("reaction_type", "like")
    .single();

  let liked: boolean;

  if (existing) {
    await supabase.from("post_reactions").delete().eq("id", existing.id);
    liked = false;
  } else {
    await supabase.from("post_reactions").insert({
      post_id: params.id,
      user_id: user.id,
      reaction_type: "like",
    });
    liked = true;
  }

  const { count } = await supabase
    .from("post_reactions")
    .select("id", { count: "exact", head: true })
    .eq("post_id", params.id)
    .eq("reaction_type", "like");

  return NextResponse.json<ApiResult<{ liked: boolean; count: number }>>({
    success: true,
    data: { liked, count: count ?? 0 },
  });
}
