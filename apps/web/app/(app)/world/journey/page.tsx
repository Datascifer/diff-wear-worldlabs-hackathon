import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { assertAuthenticated } from "../../../../../../services/auth";
import {
  JOURNEY_CHAPTERS,
  getJourneyProgress,
  isChapterUnlocked,
} from "../../../../../../services/world-labs/identity-journey";

export default async function JourneyPage() {
  const supabase = createClient();
  const user = await assertAuthenticated(supabase);

  const progress = await getJourneyProgress(user.id, supabase);

  const chapters = await Promise.all(
    JOURNEY_CHAPTERS.map(async (chapter) => {
      const status = progress?.find((item: { chapter_number: number; completed_at: string | null }) => item.chapter_number === chapter.number);
      const unlockedState = await isChapterUnlocked(user.id, chapter.number, supabase);
      return {
        ...chapter,
        unlocked: unlockedState.unlocked,
        completed: Boolean(status?.completed_at),
      };
    })
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold text-white">Identity Journey</h1>
      <p className="text-sm text-white/70">Five private chapters. New chapters unlock 24 hours after completion.</p>

      <div className="space-y-3">
        {chapters.map((chapter) => (
          <div key={chapter.number} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h2 className="text-lg text-white">{chapter.number}. {chapter.title}</h2>
            <p className="text-sm text-white/65">{chapter.subtitle}</p>
            <p className="mt-2 text-xs text-white/70">
              {chapter.completed ? "✅ Completed" : chapter.unlocked ? "🔓 Unlocked" : "🔒 Locked"}
            </p>
            {chapter.unlocked ? (
              <Link href={`/world/journey/${chapter.number}`} className="mt-3 inline-block rounded-lg bg-indigo-500 px-3 py-1 text-xs text-white">
                Open chapter
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
