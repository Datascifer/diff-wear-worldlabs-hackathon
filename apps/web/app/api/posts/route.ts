import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { ApiResult } from "@/types/domain";

export async function GET(request: NextRequest) {
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

  // 2. Resolve age tier from DB — never from client
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

  const { searchParams } = new URL(request.url);
  const postType = searchParams.get("type");
  const cursor = searchParams.get("cursor");
  const isMinor = profile.age_tier === "minor";

  // 3. Build query with age-tier enforcement
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

  if (isMinor) {
    query = query.eq("audience", "all_ages");
  }
  if (postType) {
    query = query.eq("post_type", postType);
  }
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: posts, error } = await query;

  if (error) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Failed to fetch posts." } },
      { status: 500 }
    );
  }

  const nextCursor =
    posts && posts.length === 20
      ? (posts[posts.length - 1]?.created_at ?? null)
      : null;

  return NextResponse.json<
    ApiResult<{ posts: typeof posts; nextCursor: string | null }>
  >({ success: true, data: { posts, nextCursor } });
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

  // 2. Resolve age tier from DB
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

  const body = (await request.json()) as {
    content?: string;
    post_type?: string;
    audience?: string;
    media_url?: string;
  };

  if (!body.content || body.content.trim().length === 0) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "INVALID_CONTENT", message: "Post content is required." } },
      { status: 422 }
    );
  }
  if (body.content.length > 500) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "CONTENT_TOO_LONG", message: "Post content must be 500 characters or fewer." } },
      { status: 422 }
    );
  }

  const validPostTypes = ["spirit", "move", "community", "wellness"];
  if (!body.post_type || !validPostTypes.includes(body.post_type)) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "INVALID_POST_TYPE", message: "Invalid post type." } },
      { status: 422 }
    );
  }

  // 3. Capability enforcement — minor cannot post adults_only
  const isMinor = profile.age_tier === "minor";
  if (isMinor && body.audience === "adults_only") {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "MINOR_AUDIENCE_VIOLATION", message: "Minors cannot set audience to adults_only." } },
      { status: 403 }
    );
  }

  const audience =
    isMinor ? "all_ages" : body.audience === "adults_only" ? "adults_only" : "all_ages";

  // 4. Insert post with pending moderation status
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      content: body.content.trim(),
      post_type: body.post_type,
      audience,
      media_url: body.media_url ?? null,
      moderation_status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Failed to create post." } },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResult<typeof post>>(
    { success: true, data: post },
    { status: 201 }
  );
}
