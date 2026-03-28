import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertAuthenticated } from "../../../../../../../../services/auth";
import {
  isChapterUnlocked,
  type ChapterNumber,
} from "../../../../../../../../services/world-labs/identity-journey";

interface Context {
  params: { chapter: string };
}

export async function GET(_request: Request, context: Context) {
  const supabase = createClient();
  const user = await assertAuthenticated(supabase);
  const chapter = Number(context.params.chapter);

  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 5) {
    return NextResponse.json({ data: null, error: "Invalid chapter" }, { status: 422 });
  }

  const data = await isChapterUnlocked(user.id, chapter as ChapterNumber, supabase);
  return NextResponse.json({ data, error: null });
}
