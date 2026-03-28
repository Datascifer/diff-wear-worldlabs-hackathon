"use client";

import { useState, useEffect, useRef } from "react";

const FALLBACK_SCRIPTURES = [
  { verse: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
  { verse: "For God gave us a spirit not of fear but of power and love and self-control.", reference: "2 Timothy 1:7" },
  { verse: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", reference: "Isaiah 40:31" },
  { verse: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
  { verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you.", reference: "Joshua 1:9" },
];

export function ScriptureBanner() {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % FALLBACK_SCRIPTURES.length);
    }, 8000);
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
      const data = (await res.json()) as { data?: { audioUrl?: string | null } };
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
    <div
      className="rounded-lg p-5 relative overflow-hidden"
      style={{
        background: "var(--gradient-aurora)",
      }}
    >
      {/* Subtle inner shadow for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.20)" }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.60)", letterSpacing: "0.12em" }}
          >
            Word of the Day
          </p>
          <blockquote
            className="text-sm leading-relaxed italic"
            style={{
              fontFamily: "var(--font-display)",
              color: "rgba(255,255,255,0.95)",
              fontStyle: "italic",
            }}
          >
            &ldquo;{current.verse}&rdquo;
          </blockquote>
          <cite
            className="block text-xs not-italic font-medium"
            style={{ color: "rgba(255,255,255,0.60)", letterSpacing: "0.06em" }}
          >
            {current.reference}
          </cite>
        </div>

        <button
          onClick={() => { void handlePlay(); }}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "white",
          }}
          aria-label={isPlaying ? "Pause audio" : "Play audio narration"}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
