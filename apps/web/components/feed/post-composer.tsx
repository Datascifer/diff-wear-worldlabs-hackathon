"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const POST_TYPES = [
  { value: "spirit", label: "Spirit", icon: "✝️" },
  { value: "move", label: "Move", icon: "💪" },
  { value: "community", label: "Community", icon: "🌍" },
  { value: "wellness", label: "Wellness", icon: "🌿" },
] as const;

type PostTypeValue = (typeof POST_TYPES)[number]["value"];

const MAX_CHARS = 500;

interface PostComposerProps {
  userId: string;
  isMinor: boolean;
}

export function PostComposer({ isMinor }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostTypeValue>("spirit");
  const [audience, setAudience] = useState<"all_ages" | "adults_only">(
    "all_ages"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charsLeft = MAX_CHARS - content.length;
  const isNearLimit = charsLeft <= 50;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          post_type: postType,
          audience: isMinor ? "all_ages" : audience,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as {
          error?: { message?: string };
        };
        setError(data.error?.message ?? "Failed to post. Try again.");
        return;
      }

      setContent("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your heart today?"
          maxLength={MAX_CHARS}
          rows={3}
          className="w-full bg-transparent text-white placeholder-white/30 text-sm resize-none outline-none leading-relaxed"
          aria-label="Post content"
        />

        {/* Post type chips */}
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {POST_TYPES.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setPostType(value)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                postType === value ? "text-black" : "text-white/50 hover:text-white/80"
              )}
              style={
                postType === value
                  ? { background: "linear-gradient(135deg, #FFD600, #FF6B00)" }
                  : {
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }
              }
              aria-pressed={postType === value}
            >
              <span aria-hidden="true">{icon}</span> {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isMinor && (
              <select
                value={audience}
                onChange={(e) =>
                  setAudience(e.target.value as "all_ages" | "adults_only")
                }
                className="text-xs text-white/60 bg-transparent border border-white/10 rounded-lg px-2 py-1 outline-none"
                aria-label="Audience"
              >
                <option value="all_ages">All Ages</option>
                <option value="adults_only">18+ Only</option>
              </select>
            )}
            <span
              className={cn(
                "text-xs",
                isNearLimit ? "text-orange-400" : "text-white/30"
              )}
            >
              {charsLeft}
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={loading || content.trim().length === 0}
          >
            {loading ? "Sharing…" : "Share"}
          </Button>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    </Card>
  );
}
