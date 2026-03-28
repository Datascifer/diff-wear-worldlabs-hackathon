"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { Post } from "@/types/domain";

type GradientName = "solar" | "cosmic" | "aurora" | "divine" | "flame";

const POST_TYPE_META: Record<
  string,
  { label: string; gradient: GradientName; icon: string }
> = {
  spirit: { label: "Spirit", gradient: "divine", icon: "✝️" },
  move: { label: "Move", gradient: "flame", icon: "💪" },
  community: { label: "Community", gradient: "cosmic", icon: "🌍" },
  wellness: { label: "Wellness", gradient: "aurora", icon: "🌿" },
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

  const authorName = post.author?.display_name ?? "Anonymous";
  const initial = authorName.charAt(0).toUpperCase();

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setOptimisticLikes((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      const res = await fetch(`/api/posts/${post.id}/react`, {
        method: "POST",
      });
      if (!res.ok) {
        setLiked(liked);
        setOptimisticLikes(likeCount);
      } else {
        const data = (await res.json()) as {
          data?: { liked: boolean; count: number };
        };
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
    <Card gradient={meta.gradient}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
          style={{ background: "linear-gradient(135deg, #7B2FFF, #0057FF)" }}
          aria-hidden="true"
        >
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-medium text-sm">{authorName}</span>
            {post.author?.city && (
              <span className="text-white/40 text-xs">{post.author.city}</span>
            )}
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              {meta.icon} {meta.label}
            </span>
          </div>

          <p className="text-white/90 text-sm leading-relaxed">
            {post.content}
          </p>

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => {
                void handleLike();
              }}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                liked ? "text-red-400" : "text-white/40 hover:text-white/70"
              )}
              aria-label={liked ? "Unlike post" : "Like post"}
              aria-pressed={liked}
            >
              <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
              <span>{optimisticLikes}</span>
            </button>
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <span aria-hidden="true">💬</span>
              <span>{commentCount}</span>
            </span>
            <span className="ml-auto text-white/30 text-xs">
              {new Date(post.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
