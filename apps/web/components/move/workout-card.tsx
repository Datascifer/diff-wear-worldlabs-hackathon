"use client";

import { useState } from "react";
import type { PlanType } from "@/types/domain";

const PLAN_TYPE_META: Record<PlanType, { icon: string; color: string; bg: string }> = {
  cardio:      { icon: "⚡", color: "#FF6B00", bg: "rgba(255,107,0,0.15)"  },
  strength:    { icon: "◈",  color: "#E8003D", bg: "rgba(232,0,61,0.12)"   },
  flexibility: { icon: "◯",  color: "#A855FF", bg: "rgba(168,85,255,0.12)" },
  breathwork:  { icon: "∿",  color: "#4DA6FF", bg: "rgba(77,166,255,0.12)" },
};

interface WorkoutCardProps {
  plan: {
    id: string;
    title: string;
    plan_type: PlanType;
    duration_minutes: number;
    scripture_reference: string;
  };
}

export function WorkoutCard({ plan }: WorkoutCardProps) {
  const [completed, setCompleted] = useState(false);
  const meta = PLAN_TYPE_META[plan.plan_type];

  const handleToggle = async () => {
    const next = !completed;
    setCompleted(next);
    if (next) {
      await fetch("/api/move/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, durationMinutes: plan.duration_minutes }),
      }).catch(() => null);
    }
  };

  return (
    <div
      className="rounded-lg p-4 flex items-center gap-4 transition-all"
      style={{
        background: completed ? "var(--color-bg-surface)" : "var(--color-glass-bg)",
        backdropFilter: completed ? "none" : "blur(16px)",
        WebkitBackdropFilter: completed ? "none" : "blur(16px)",
        border: "1px solid var(--color-border-default)",
        opacity: completed ? 0.55 : 1,
      }}
    >
      {/* Type icon */}
      <div
        className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 text-base font-bold"
        style={{ background: meta.bg, color: meta.color }}
        aria-hidden="true"
      >
        {meta.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold"
          style={{
            color: completed ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
            textDecoration: completed ? "line-through" : "none",
          }}
        >
          {plan.title}
        </p>
        {/* Faith + movement pairing — the split line */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {plan.duration_minutes} min
          </span>
          <span
            className="w-px h-3 inline-block"
            style={{ background: "var(--color-border-strong)" }}
            aria-hidden="true"
          />
          <span
            className="text-xs italic truncate"
            style={{ color: "var(--color-accent-purple)", opacity: 0.80 }}
          >
            {plan.scripture_reference}
          </span>
        </div>
      </div>

      {/* Completion toggle */}
      <button
        onClick={() => { void handleToggle(); }}
        className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
        style={
          completed
            ? { background: "var(--gradient-flame)", border: "none" }
            : { background: "transparent", borderColor: "var(--color-border-strong)" }
        }
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
        aria-pressed={completed}
      >
        {completed && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </button>
    </div>
  );
}
