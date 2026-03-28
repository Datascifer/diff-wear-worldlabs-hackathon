import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IdentityChapter } from "@/components/world/identity-chapter";
import { assertAuthenticated, resolveAgeTier } from "../../../../../../../services/auth";
import {
  JOURNEY_CHAPTERS,
  isChapterUnlocked,
  startChapter,
  type ChapterNumber,
} from "../../../../../../../services/world-labs/identity-journey";

interface JourneyChapterPageProps {
  params: { chapter: string };
}

export default async function JourneyChapterPage({ params }: JourneyChapterPageProps) {
  const chapterNumber = Number(params.chapter);
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 5) {
    redirect("/world/journey");
  }

  const supabase = createClient();
  const user = await assertAuthenticated(supabase);
  await resolveAgeTier(user.id, supabase);

  const unlocked = await isChapterUnlocked(user.id, chapterNumber as ChapterNumber, supabase);
  if (!unlocked.unlocked) {
    redirect("/world/journey?locked=true");
  }

  await startChapter(user.id, chapterNumber as ChapterNumber, supabase);

  const chapter = JOURNEY_CHAPTERS.find((entry) => entry.number === chapterNumber);
  if (!chapter) redirect("/world/journey");

  const nextHref = chapterNumber < 5 ? `/world/journey/${chapterNumber + 1}` : "/world/journey?completed=true";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <IdentityChapter
        chapterNumber={chapter.number}
        title={chapter.title}
        subtitle={chapter.subtitle}
        scripture={chapter.scripture}
        scriptureRef={chapter.scriptureRef}
        prompt={chapter.prompt}
        nextHref={nextHref}
      />
    </div>
  );
}
