import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertAuthenticated } from "../../../../../../../services/auth";
import {
  completeChapter,
  getJourneyProgress,
  isChapterUnlocked,
  JOURNEY_CHAPTERS,
  startChapter,
  type ChapterNumber,
} from "../../../../../../../services/world-labs/identity-journey";

export async function GET() {
  const supabase = createClient();
  const user = await assertAuthenticated(supabase);

  const progress = await getJourneyProgress(user.id, supabase);

  const chapters = await Promise.all(
    JOURNEY_CHAPTERS.map(async (chapter) => {
      const saved = progress?.find((entry: { chapter_number: number; started_at: string | null; completed_at: string | null }) => entry.chapter_number === chapter.number);
      const { unlocked, unlocksAt } = await isChapterUnlocked(user.id, chapter.number, supabase);
      return {
        number: chapter.number,
        title: chapter.title,
        subtitle: chapter.subtitle,
        scriptureRef: chapter.scriptureRef,
        unlocked,
        unlocksAt,
        started: Boolean(saved?.started_at),
        completed: Boolean(saved?.completed_at),
      };
    })
  );

  return NextResponse.json({ data: chapters, error: null });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const user = await assertAuthenticated(supabase);
  const body = (await request.json()) as {
    chapterNumber?: number;
    action?: "start" | "complete";
  };

  const chapterNumber = body.chapterNumber;
  if (!chapterNumber || chapterNumber < 1 || chapterNumber > 5) {
    return NextResponse.json({ data: null, error: "Invalid chapter number" }, { status: 422 });
  }

  if (body.action === "start") {
    await startChapter(user.id, chapterNumber as ChapterNumber, supabase);
    return NextResponse.json({ data: { ok: true }, error: null });
  }

  await completeChapter(user.id, chapterNumber as ChapterNumber, supabase);
  return NextResponse.json({ data: { ok: true }, error: null });
}
