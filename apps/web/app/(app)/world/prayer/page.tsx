"use client";

import { useEffect, useMemo, useState } from "react";
import { PrayerRoomEnv } from "@/components/world/prayer-room-env";

const PRESETS = [5, 10, 20] as const;

export default function PrayerRoomPage() {
  const [minutes, setMinutes] = useState<number>(5);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    void fetch("/api/world/prayer/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start" }),
    });
  }, []);

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running]);

  const remaining = useMemo(() => Math.max(minutes * 60 - elapsed, 0), [elapsed, minutes]);

  useEffect(() => {
    if (running && remaining === 0) {
      setRunning(false);
    }
  }, [remaining, running]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold text-white">Prayer Room</h1>
      <PrayerRoomEnv
        verse="Be still, and know that I am God."
        reference="Psalm 46:10"
      />

      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`rounded-lg px-3 py-1 text-sm ${minutes === preset ? "bg-indigo-500 text-white" : "bg-white/10 text-white/70"}`}
            onClick={() => {
              setMinutes(preset);
              setElapsed(0);
            }}
          >
            {preset} min
          </button>
        ))}
      </div>

      <p className="text-sm text-white/70">Time remaining: {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</p>

      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white"
          onClick={() => {
            setRunning(true);
            // ELEVENLABS_INTEGRATION: play scripted opening prayer narration.
          }}
        >
          Begin
        </button>
        <button
          type="button"
          className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white"
          onClick={() => {
            setRunning(false);
            void fetch("/api/world/prayer/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "end", durationSeconds: elapsed, scriptureRef: "Psalm 46:10" }),
            });
          }}
        >
          End Session
        </button>
      </div>
    </div>
  );
}
