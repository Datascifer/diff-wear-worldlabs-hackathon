import { createClient } from "@/lib/supabase/server";
import { ScriptureBanner } from "@/components/scripture/scripture-banner";
import { FeedFilter } from "@/components/feed/feed-filter";
import { PostCard } from "@/components/feed/post-card";
import { PostComposer } from "@/components/feed/post-composer";
import type { Post } from "@/types/domain";

export default async function FeedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("age_tier, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  const isMinor = profile?.age_tier === "minor";

  let query = supabase
    .from("posts")
    .select(
      `
      id, content, post_type, audience, media_url, created_at,
      author:users(id, display_name, avatar_url, city),
      reactions:post_reactions(count),
      comments(count)
    `
    )
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  if (isMinor) {
    query = query.eq("audience", "all_ages");
  }

  const { data: posts } = await query;

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      <ScriptureBanner />
      <PostComposer userId={user.id} isMinor={isMinor} />
      <FeedFilter />
      <div className="space-y-3">
        {posts?.map((post) => (
          <PostCard
            key={post.id}
            post={post as unknown as Post}
            currentUserId={user.id}
          />
        ))}
        {(!posts || posts.length === 0) && (
          <div className="text-center py-16 text-white/40">
            <p className="text-4xl mb-3">✦</p>
            <p className="text-sm">
              The feed is quiet. Be the first to share something.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
