import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { ApiResult } from "@/types/domain";
import { checkLimit } from "@/lib/utils/rate-limit";
import { apiError, apiRateLimited, sanitizeText } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", "Authentication required.", 401);

  // Resolve age tier from DB — never from client
  const { data: profile } = await supabase
    .from("users")
    .select("age_tier, account_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.account_status !== "active") {
    return apiError("ACCOUNT_INACTIVE", "Account is not active.", 403);
  }

  const { searchParams } = new URL(request.url);
  const postType = searchParams.get("type");
  const cursor = searchParams.get("cursor");
  const isMinor = profile.age_tier === "minor";

  let query = supabase
    .from("posts")
    .select(
      `id, content, post_type, audience, media_url, created_at,
      author:users(id, display_name, avatar_url, city),
      reactions:post_reactions(count),
      comments(count)`
    )
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  // INVARIANT: minors always see only all_ages content (RLS also enforces this)
  if (isMinor) query = query.eq("audience", "all_ages");
  if (postType) query = query.eq("post_type", postType);
  if (cursor) query = query.lt("created_at", cursor);

  const { data: posts, error } = await query;

  if (error) return apiError("DB_ERROR", "Failed to fetch posts.", 500);

  const nextCursor =
    posts && posts.length === 20
      ? (posts[posts.length - 1]?.created_at ?? null)
      : null;

  return NextResponse.json<ApiResult<{ posts: typeof posts; nextCursor: string | null }>>(
    { success: true, data: { posts, nextCursor } }
  );
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", "Authentication required.", 401);

  // Rate limit: 10 posts per hour per user
  const rl = await checkLimit("postCreate", user.id);
  if (!rl.success) return apiRateLimited(rl.reset);

  const { data: profile } = await supabase
    .from("users")
    .select("age_tier, account_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.account_status !== "active") {
    return apiError("ACCOUNT_INACTIVE", "Account is not active.", 403);
  }

  const body = (await request.json()) as {
    content?: string;
    post_type?: string;
    audience?: string;
    media_url?: string;
  };

  if (!body.content || body.content.trim().length === 0) {
    return apiError("INVALID_CONTENT", "Post content is required.", 422);
  }
  if (body.content.length > 500) {
    return apiError("CONTENT_TOO_LONG", "Post must be 500 characters or fewer.", 422);
  }

  const content = sanitizeText(body.content, 500);

  const validPostTypes = ["spirit", "move", "community", "wellness"];
  if (!body.post_type || !validPostTypes.includes(body.post_type)) {
    return apiError("INVALID_POST_TYPE", "Invalid post type.", 422);
  }

  // INVARIANT: minors cannot set adults_only audience
  const isMinor = profile.age_tier === "minor";
  if (isMinor && body.audience === "adults_only") {
    return apiError("MINOR_AUDIENCE_VIOLATION", "Minors cannot set audience to adults_only.", 403);
  }

  const audience = isMinor
    ? "all_ages"
    : body.audience === "adults_only"
    ? "adults_only"
    : "all_ages";

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      content,
      post_type: body.post_type,
      audience,
      media_url: body.media_url ?? null,
      moderation_status: "pending",
    })
    .select()
    .single();

  if (error) return apiError("DB_ERROR", "Failed to create post.", 500);

  return NextResponse.json<ApiResult<typeof post>>(
    { success: true, data: post },
    { status: 201 }
  );
}
