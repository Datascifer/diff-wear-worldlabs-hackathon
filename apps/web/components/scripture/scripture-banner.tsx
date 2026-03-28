"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

const FALLBACK_SCRIPTURES = [
  {
    verse: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13",
  },
  {
    verse:
      "For God gave us a spirit not of fear but of power and love and self-control.",
    reference: "2 Timothy 1:7",
  },
  {
    verse:
      "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.",
    reference: "Isaiah 40:31",
  },
  {
    verse:
      "Trust in the Lord with all your heart and lean not on your own understanding.",
    reference: "Proverbs 3:5",
  },
  {
    verse:
      "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you.",
    reference: "Joshua 1:9",
  },
];

export function ScriptureBanner() {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % FALLBACK_SCRIPTURES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const handlePlay = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    try {
      const res = await fetch("/api/scripture/today");
      if (!res.ok) return;
      const data = (await res.json()) as {
        data?: { audioUrl?: string | null };
      };
      const audioUrl = data.data?.audioUrl;
      if (!audioUrl) return;

      audioRef.current?.pause();
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      await audio.play();
      setIsPlaying(true);
    } catch {
      // Audio unavailable — fail silently
    }
  };

  const current = FALLBACK_SCRIPTURES[index];
  if (!current) return null;

  return (
    <Card gradient="divine">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
            Word of the Day
          </p>
          <blockquote className="text-white text-sm leading-relaxed italic mb-1">
            &ldquo;{current.verse}&rdquo;
          </blockquote>
          <cite className="text-white/50 text-xs not-italic">
            — {current.reference}
          </cite>
        </div>
        <button
          onClick={() => {
            void handlePlay();
          }}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/20"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
          aria-label={isPlaying ? "Pause audio" : "Play audio narration"}
        >
          <span className="text-sm" aria-hidden="true">
            {isPlaying ? "⏸" : "▶"}
          </span>
        </button>
      </div>
    </Card>
  );
}
