import type { SupabaseClient } from "@supabase/supabase-js";
import { screenContent } from "./moderation-gate";
import type {
  AgeTier,
  Post,
  PaginatedResult,
} from "../../apps/web/types/domain";

export interface GetFeedParams {
  ageTier: AgeTier;
  postType?: string;
  cursor?: string;
  limit?: number;
}

export interface CreatePostInput {
  content: string;
  post_type: string;
  audience: "all_ages" | "adults_only";
  media_url?: string;
}

export async function getFeed(
  params: GetFeedParams,
  supabase: SupabaseClient
): Promise<PaginatedResult<Post>> {
  const limit = params.limit ?? 20;
  const isMinor = params.ageTier === "minor";

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
    .limit(limit);

  if (isMinor) {
    query = query.eq("audience", "all_ages");
  }
  if (params.postType) {
    query = query.eq("post_type", params.postType);
  }
  if (params.cursor) {
    query = query.lt("created_at", params.cursor);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch feed: ${error.message}`);
  }

  const posts = (data ?? []) as Post[];
  const nextCursor =
    posts.length === limit
      ? (posts[posts.length - 1]?.created_at ?? null)
      : null;

  return { items: posts, nextCursor };
}

export async function createPost(
  input: CreatePostInput,
  userId: string,
  ageTier: AgeTier,
  supabase: SupabaseClient
): Promise<Post> {
  // Enforce minor audience constraint at the service layer (defense-in-depth)
  if (ageTier === "minor" && input.audience === "adults_only") {
    throw new Error("Minors cannot create adults_only posts.");
  }

  // Pre-publication moderation gate
  const gate = await screenContent(input.content, ageTier);
  if (!gate.allowed) {
    const err = new Error(gate.reason ?? "Content did not pass moderation.");
    (err as Error & { code?: string }).code = "CONTENT_MODERATED";
    throw err;
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: userId,
      content: input.content.trim(),
      post_type: input.post_type,
      audience: ageTier === "minor" ? "all_ages" : input.audience,
      media_url: input.media_url ?? null,
      moderation_status: "pending",
    })
    .select()
    .single();

  if (error ?? !data) {
    throw new Error(
      `Failed to create post: ${error?.message ?? "unknown error"}`
    );
  }

  return data as Post;
}

export async function reactToPost(
  postId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<{ liked: boolean; count: number }> {
  const { data: existing } = await supabase
    .from("post_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .eq("reaction_type", "like")
    .single();

  let liked: boolean;

  if (existing) {
    await supabase.from("post_reactions").delete().eq("id", existing.id);
    liked = false;
  } else {
    await supabase.from("post_reactions").insert({
      post_id: postId,
      user_id: userId,
      reaction_type: "like",
    });
    liked = true;
  }

  const { count } = await supabase
    .from("post_reactions")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId)
    .eq("reaction_type", "like");

  return { liked, count: count ?? 0 };
}
