import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { ApiResult } from "@/types/domain";

export async function GET(
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

  // 2. Resolve age tier from DB
  const { data: profile } = await supabase
    .from("users")
    .select("age_tier")
    .eq("id", user.id)
    .single();

  const isMinor = profile?.age_tier === "minor";

  // 3. Fetch post with age-tier access check
  const baseSelect = `id, content, post_type, audience, media_url, created_at,
    author:users(id, display_name, avatar_url, city),
    reactions:post_reactions(count), comments(count)`;

  const query = supabase
    .from("posts")
    .select(baseSelect)
    .eq("id", params.id)
    .eq("moderation_status", "approved");

  const finalQuery = isMinor ? query.eq("audience", "all_ages") : query;
  const { data: post, error } = await finalQuery.single();

  if (error ?? !post) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "NOT_FOUND", message: "Post not found." } },
      { status: 404 }
    );
  }

  return NextResponse.json<ApiResult<typeof post>>({ success: true, data: post });
}

export async function DELETE(
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

  // 2. Resolve staff status from DB
  const { data: profile } = await supabase
    .from("users")
    .select("is_staff")
    .eq("id", user.id)
    .single();

  const { data: post } = await supabase
    .from("posts")
    .select("id, author_id")
    .eq("id", params.id)
    .single();

  if (!post) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "NOT_FOUND", message: "Post not found." } },
      { status: 404 }
    );
  }

  const isAuthor = post.author_id === user.id;
  const isStaff = profile?.is_staff === true;

  if (!isAuthor && !isStaff) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "FORBIDDEN", message: "Not authorized to delete this post." } },
      { status: 403 }
    );
  }

  // Soft delete — never hard delete posts
  const { error } = await supabase
    .from("posts")
    .update({ moderation_status: "removed" })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Failed to delete post." } },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResult<{ deleted: true }>>({
    success: true,
    data: { deleted: true },
  });
}
