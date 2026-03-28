"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface IdentityChapterProps {
  chapterNumber: number;
  title: string;
  subtitle: string;
  scripture: string;
  scriptureRef: string;
  prompt: string;
  nextHref: string;
}

export function IdentityChapter(props: IdentityChapterProps) {
  const [journal, setJournal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`journey-chapter-${props.chapterNumber}`);
      if (saved) setJournal(saved);
    } catch {
      // no-op
    }
  }, [props.chapterNumber]);

  return (
    <section className="space-y-5 rounded-3xl border border-white/10 bg-slate-900/60 p-5">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Chapter {props.chapterNumber}</p>
        <h1 className="text-2xl font-semibold text-white">{props.title}</h1>
        <p className="text-sm text-white/65">{props.subtitle}</p>
      </header>

      <blockquote className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80 italic">
        “{props.scripture}”
        <footer className="mt-2 not-italic text-xs uppercase tracking-[0.2em] text-white/60">
          {props.scriptureRef}
        </footer>
      </blockquote>

      <p className="text-sm text-white/85">{props.prompt}</p>

      <textarea
        className="min-h-40 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-white outline-none focus:border-indigo-400"
        placeholder="Private reflection (saved only on this device)."
        value={journal}
        onChange={(event) => {
          const value = event.target.value;
          setJournal(value);
          try {
            localStorage.setItem(`journey-chapter-${props.chapterNumber}`, value);
          } catch {
            // no-op
          }
        }}
      />

      <button
        type="button"
        disabled={submitting}
        onClick={() => {
          setSubmitting(true);
          void fetch("/api/world/journey/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chapterNumber: props.chapterNumber, action: "complete" }),
          })
            .then(() => router.push(props.nextHref))
            .catch(() => setSubmitting(false));
        }}
        className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Completing..." : "Complete Chapter"}
      </button>
    </section>
  );
}
