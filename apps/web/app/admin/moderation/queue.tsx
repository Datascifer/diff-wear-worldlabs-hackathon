"use client";

import { useState } from "react";

interface Flag {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  status: string;
  scores: Record<string, unknown> | null;
  created_at: string;
  flagged_by: { display_name: string } | null;
}

interface QueueProps {
  flags: Flag[];
}

export default function ModerationQueue({ flags: initialFlags }: QueueProps) {
  const [flags, setFlags] = useState(initialFlags);
  const [loading, setLoading] = useState<string | null>(null);

  const resolveFlag = async (
    flagId: string,
    outcome: "reviewed" | "actioned" | "dismissed",
    note?: string
  ) => {
    setLoading(flagId);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagId, outcome, notes: note }),
      });
      if (res.ok) {
        setFlags((prev) => prev.filter((f) => f.id !== flagId));
      }
    } finally {
      setLoading(null);
    }
  };

  if (flags.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <p className="text-white/40 text-sm">Queue is clear.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <div
          key={flag.id}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "rgba(255,107,0,0.2)", color: "#FF6B00" }}
                >
                  {flag.content_type}
                </span>
                <span className="text-white/30 text-xs">
                  {new Date(flag.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-white text-sm">{flag.reason}</p>
              {flag.flagged_by && (
                <p className="text-white/30 text-xs">
                  Reported by {flag.flagged_by.display_name}
                </p>
              )}
            </div>
          </div>

          {flag.scores && (
            <details className="text-xs">
              <summary className="text-white/30 cursor-pointer">Perspective scores</summary>
              <pre
                className="mt-1 p-2 rounded-lg text-white/50 overflow-auto"
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                {JSON.stringify(flag.scores, null, 2)}
              </pre>
            </details>
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => void resolveFlag(flag.id, "dismissed")}
              disabled={loading === flag.id}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-white/60 disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              Dismiss
            </button>
            <button
              onClick={() => void resolveFlag(flag.id, "reviewed")}
              disabled={loading === flag.id}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-white/60 disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              Mark reviewed
            </button>
            <button
              onClick={() => void resolveFlag(flag.id, "actioned", "Content removed by staff.")}
              disabled={loading === flag.id}
              className="px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-40"
              style={{ background: "rgba(255,23,68,0.2)", color: "#FF1744" }}
            >
              Remove content
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
