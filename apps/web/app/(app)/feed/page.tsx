import { createClient } from "@/lib/supabase/server";
import { ScriptureBanner } from "@/components/scripture/scripture-banner";
import { FeedFilter } from "@/components/feed/feed-filter";
import { PostCard } from "@/components/feed/post-card";
import { PostComposer } from "@/components/feed/post-composer";
import type { Post } from "@/types/domain";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function FeedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("age_tier, display_name")
    .eq("id", user.id)
    .single();

  const isMinor = profile?.age_tier === "minor";
  const firstName = profile?.display_name?.split(" ")[0] ?? "";

  let query = supabase
    .from("posts")
    .select(`
      id, content, post_type, audience, media_url, created_at,
      author:users(id, display_name, avatar_url, city),
      reactions:post_reactions(count),
      comments(count)
    `)
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  if (isMinor) query = query.eq("audience", "all_ages");

  const { data: posts } = await query;

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-6 space-y-5">

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.10em" }}>
            {greeting()}
          </p>
          {firstName && (
            <h1
              className="text-xl font-semibold mt-0.5"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
            >
              {firstName}
            </h1>
          )}
        </div>
        {/* Notification bell placeholder */}
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-default)",
            color: "var(--color-text-tertiary)",
          }}
          aria-label="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
        </button>
      </div>

      {/* Scripture banner */}
      <ScriptureBanner />

      {/* Composer */}
      <PostComposer userId={user.id} isMinor={isMinor} />

      {/* Filter */}
      <FeedFilter />

      {/* Posts */}
      <div className="space-y-4">
        {posts?.map((post, i) => (
          <div
            key={post.id}
            className="animate-card-enter"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <PostCard
              post={post as unknown as Post}
              currentUserId={user.id}
            />
          </div>
        ))}
        {(!posts || posts.length === 0) && (
          <div
            className="text-center py-16"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <p className="text-3xl mb-3" aria-hidden="true">✦</p>
            <p className="text-sm">The feed is quiet. Be the first to share.</p>
          </div>
        )}
      </div>
    </div>
  );
}
