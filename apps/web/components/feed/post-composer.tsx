"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MediaUploader } from "@/components/feed/media-uploader";

const POST_TYPES = [
  { value: "spirit",    label: "Spirit",    color: "#A855FF", bg: "rgba(168,85,255,0.15)" },
  { value: "move",      label: "Move",      color: "#FF6B00", bg: "rgba(255,107,0,0.15)"  },
  { value: "community", label: "Community", color: "#4DA6FF", bg: "rgba(77,166,255,0.15)" },
  { value: "wellness",  label: "Wellness",  color: "#00D97E", bg: "rgba(0,217,126,0.12)"  },
] as const;

type PostTypeValue = (typeof POST_TYPES)[number]["value"];

interface PostComposerProps {
  userId: string;
  isMinor: boolean;
}

export function PostComposer({ isMinor }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostTypeValue>("spirit");
  const [audience, setAudience] = useState<"all_ages" | "adults_only">("all_ages");
  const [mediaPath, setMediaPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charsLeft = 500 - content.length;
  const isNearLimit = charsLeft <= 50;
  const canSubmit = content.trim().length > 0 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
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
          media_url: mediaPath ?? undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: { message?: string } };
        setError(data.error?.message ?? "Failed to post. Try again.");
        return;
      }
      setContent("");
      setMediaPath(null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-lg p-5 space-y-4"
      style={{
        background: "var(--color-glass-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--color-glass-border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your heart today?"
        maxLength={500}
        rows={3}
        className="w-full bg-transparent resize-none outline-none leading-relaxed text-sm"
        style={{
          color: "var(--color-text-primary)",
          caretColor: "var(--color-accent-yellow)",
        }}
        aria-label="Post content"
      />

      {/* Media uploader */}
      <MediaUploader
        onUpload={(path) => setMediaPath(path)}
        onClear={() => setMediaPath(null)}
      />

      {/* Post type chips */}
      <div
        className="flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
        role="group"
        aria-label="Post category"
      >
        {POST_TYPES.map(({ value, label, color, bg }) => {
          const isActive = postType === value;
          return (
            <button
              key={value}
              onClick={() => setPostType(value)}
              className="flex-shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-all"
              style={{
                background: isActive ? bg : "transparent",
                color: isActive ? color : "var(--color-text-tertiary)",
                border: isActive ? `1px solid ${color}40` : "1px solid var(--color-border-default)",
                letterSpacing: "0.04em",
              }}
              aria-pressed={isActive}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {!isMinor && (
            <button
              onClick={() => setAudience((a) => (a === "all_ages" ? "adults_only" : "all_ages"))}
              className="h-8 px-3 rounded-full text-xs transition-all"
              style={{
                background: audience === "adults_only" ? "rgba(255,107,0,0.12)" : "transparent",
                color: audience === "adults_only" ? "var(--color-accent-orange)" : "var(--color-text-tertiary)",
                border: "1px solid var(--color-border-default)",
              }}
              aria-label={`Audience: ${audience === "all_ages" ? "All ages" : "18+ only"}`}
            >
              {audience === "all_ages" ? "All ages" : "18+ only"}
            </button>
          )}
          <span
            className="text-xs tabular-nums"
            style={{ color: isNearLimit ? "var(--color-warning)" : "var(--color-text-tertiary)" }}
          >
            {charsLeft}
          </span>
        </div>

        <Button size="sm" onClick={() => { void handleSubmit(); }} disabled={!canSubmit}>
          {loading ? "Sharing…" : "Share"}
        </Button>
      </div>

      {error && (
        <p
          className="text-xs px-3 py-2 rounded-md"
          style={{
            color: "var(--color-error)",
            background: "rgba(255,51,85,0.08)",
            border: "1px solid rgba(255,51,85,0.20)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
