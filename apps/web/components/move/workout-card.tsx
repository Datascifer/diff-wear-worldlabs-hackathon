"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { PlanType } from "@/types/domain";

type GradientName = "solar" | "cosmic" | "aurora" | "divine" | "flame";

const PLAN_TYPE_META: Record<
  PlanType,
  { icon: string; gradient: GradientName }
> = {
  cardio: { icon: "🏃", gradient: "flame" },
  strength: { icon: "💪", gradient: "solar" },
  flexibility: { icon: "🧘", gradient: "aurora" },
  breathwork: { icon: "🌬️", gradient: "divine" },
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
    const newCompleted = !completed;
    setCompleted(newCompleted);
    if (newCompleted) {
      await fetch("/api/move/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          durationMinutes: plan.duration_minutes,
        }),
      }).catch(() => {
        // Fail silently — streak syncs on next load
      });
    }
  };

  return (
    <Card gradient={meta.gradient} className={cn(completed ? "opacity-60" : "")}>
      <div className="flex items-center gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          {meta.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-white font-medium text-sm",
              completed ? "line-through text-white/50" : ""
            )}
          >
            {plan.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-white/40 text-xs">
              {plan.duration_minutes} min
            </span>
            <span className="text-white/20 text-xs">•</span>
            <span className="text-white/40 text-xs italic">
              {plan.scripture_reference}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            void handleToggle();
          }}
          className={cn(
            "w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
            completed
              ? "border-transparent text-black"
              : "border-white/20 text-transparent"
          )}
          style={
            completed
              ? { background: "linear-gradient(135deg, #FFD600, #FF6B00)" }
              : {}
          }
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
          aria-pressed={completed}
        >
          {completed && (
            <span className="text-xs" aria-hidden="true">
              ✓
            </span>
          )}
        </button>
      </div>
    </Card>
  );
}
