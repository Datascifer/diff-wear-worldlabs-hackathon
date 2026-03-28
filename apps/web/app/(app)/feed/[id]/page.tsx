import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Post } from "@/types/domain";

const POST_TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  spirit:    { label: "Spirit",    color: "#A855FF", bg: "rgba(168,85,255,0.15)" },
  move:      { label: "Move",      color: "#FF6B00", bg: "rgba(255,107,0,0.15)"  },
  community: { label: "Community", color: "#4DA6FF", bg: "rgba(77,166,255,0.15)" },
  wellness:  { label: "Wellness",  color: "#00D97E", bg: "rgba(0,217,126,0.12)"  },
};

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: post } = await supabase
    .from("posts")
    .select(`
      id, content, post_type, audience, media_url, created_at,
      author:users(id, display_name, avatar_url, city),
      reactions:post_reactions(count),
      comments(count)
    `)
    .eq("id", params.id)
    .eq("moderation_status", "approved")
    .single();

  if (!post) notFound();

  const { data: profile } = await supabase
    .from("users")
    .select("age_tier")
    .eq("id", user.id)
    .single();

  // Minors cannot view adults_only posts
  if (
    profile?.age_tier === "minor" &&
    (post as unknown as Post).audience === "adults_only"
  ) {
    notFound();
  }

  const { data: comments } = await supabase
    .from("comments")
    .select(`
      id, content, created_at,
      author:users(id, display_name, avatar_url)
    `)
    .eq("post_id", params.id)
    .order("created_at", { ascending: true })
    .limit(50);

  const p = post as unknown as Post;
  const meta = POST_TYPE_META[p.post_type] ?? POST_TYPE_META["spirit"]!;
  const authorName = p.author?.display_name ?? "Anonymous";
  const initial = authorName.charAt(0).toUpperCase();
  const likeCount = p.reactions?.[0]?.count ?? 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Back */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 text-sm transition-colors"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Feed
      </Link>

      {/* Post */}
      <article
        className="rounded-xl p-5 space-y-4"
        style={{
          background: "var(--color-glass-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--color-glass-border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0" style={{ padding: "2px", borderRadius: "50%" }}>
            <div aria-hidden="true" className="absolute inset-0 rounded-full" style={{ background: "var(--gradient-flame)" }} />
            <div
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #7B2FFF, #4040FF)",
                boxShadow: "0 0 0 2px var(--color-bg-base)",
              }}
            >
              {initial}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{authorName}</p>
            {p.author?.city && (
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{p.author.city} area</p>
            )}
          </div>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}40` }}
          >
            {meta.label}
          </span>
        </div>

        {/* Content */}
        <p className="text-base leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
          {p.content}
        </p>

        {p.media_url && (
          <div className="rounded-md overflow-hidden" style={{ aspectRatio: "16/9" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.media_url} alt="Post media" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Reactions row */}
        <div className="flex items-center gap-4 pt-1 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true">♡</span>
            {likeCount}
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            {p.comments?.[0]?.count ?? 0}
          </span>
          <span className="ml-auto text-xs">
            {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </article>

      {/* Comments */}
      <section aria-label="Comments">
        <h2
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.08em" }}
        >
          {comments?.length ? `${comments.length} comment${comments.length !== 1 ? "s" : ""}` : "No comments yet"}
        </h2>

        <div className="space-y-3">
          {comments?.map((comment) => {
            const c = comment as unknown as {
              id: string;
              content: string;
              created_at: string;
              author: { display_name: string } | null;
            };
            const cAuthor = c.author?.display_name ?? "Anonymous";
            return (
              <div
                key={c.id}
                className="rounded-lg p-4 space-y-1"
                style={{
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border-default)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {cAuthor}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {c.content}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
