"use client";

import { useState } from "react";
import type { Post } from "@/types/domain";

const POST_TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  spirit:    { label: "Spirit",    color: "#A855FF", bg: "rgba(168,85,255,0.15)" },
  move:      { label: "Move",      color: "#FF6B00", bg: "rgba(255,107,0,0.15)"  },
  community: { label: "Community", color: "#4DA6FF", bg: "rgba(77,166,255,0.15)" },
  wellness:  { label: "Wellness",  color: "#00D97E", bg: "rgba(0,217,126,0.12)"  },
};

interface PostCardProps {
  post: Post;
  currentUserId: string;
}

export function PostCard({ post, currentUserId: _currentUserId }: PostCardProps) {
  const meta = POST_TYPE_META[post.post_type] ?? POST_TYPE_META["spirit"]!;
  const likeCount = post.reactions?.[0]?.count ?? 0;
  const commentCount = post.comments?.[0]?.count ?? 0;
  const [liked, setLiked] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(likeCount);
  const [popping, setPopping] = useState(false);

  const authorName = post.author?.display_name ?? "Anonymous";
  const initial = authorName.charAt(0).toUpperCase();

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setOptimisticLikes((prev) => (newLiked ? prev + 1 : prev - 1));
    if (newLiked) {
      setPopping(true);
      setTimeout(() => setPopping(false), 250);
    }
    try {
      const res = await fetch(`/api/posts/${post.id}/react`, { method: "POST" });
      if (!res.ok) {
        setLiked(liked);
        setOptimisticLikes(likeCount);
      } else {
        const data = (await res.json()) as { data?: { liked: boolean; count: number } };
        if (data.data) {
          setLiked(data.data.liked);
          setOptimisticLikes(data.data.count);
        }
      }
    } catch {
      setLiked(liked);
      setOptimisticLikes(likeCount);
    }
  };

  return (
    <article
      className="rounded-lg p-5 space-y-3 animate-card-enter"
      style={{
        background: "var(--color-glass-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--color-glass-border)",
        boxShadow: "var(--shadow-md)",
      }}
      aria-label={`Post by ${authorName}`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        {/* Avatar with gradient ring */}
        <div className="relative flex-shrink-0" style={{ padding: "2px", borderRadius: "50%" }}>
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{ background: "var(--gradient-flame)" }}
          />
          <div
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #7B2FFF, #4040FF)",
              boxShadow: "0 0 0 2px var(--color-bg-base)",
            }}
          >
            {initial}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {authorName}
          </span>
          {post.author?.city && (
            <span className="ml-2 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              {post.author.city}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: meta.bg,
              color: meta.color,
              border: `1px solid ${meta.color}40`,
              letterSpacing: "0.04em",
            }}
          >
            {meta.label}
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {formatTimeAgo(post.created_at)}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
        {post.content}
      </p>

      {/* Media */}
      {post.media_url && (
        <div className="rounded-md overflow-hidden" style={{ aspectRatio: "16/9" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.media_url} alt="Post media" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-5 pt-1">
        <button
          onClick={() => { void handleLike(); }}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: liked ? "#E8003D" : "var(--color-text-tertiary)" }}
          aria-label={liked ? "Unlike post" : "Like post"}
          aria-pressed={liked}
        >
          <span
            className={popping ? "animate-reaction-pop" : ""}
            style={{ fontSize: "16px", lineHeight: 1 }}
            aria-hidden="true"
          >
            {liked ? "♥" : "♡"}
          </span>
          <span>{optimisticLikes}</span>
        </button>

        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span>{commentCount}</span>
        </span>
      </div>
    </article>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
