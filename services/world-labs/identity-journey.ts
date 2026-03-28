import type { SupabaseClient } from "@supabase/supabase-js";

export const JOURNEY_CHAPTERS = [
  {
    number: 1,
    title: "Who Am I?",
    subtitle: "Values under pressure",
    environment: "mirror-hall",
    scriptureRef: "Psalm 139:14",
    scripture:
      "I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.",
    prompt:
      "What three values do you refuse to compromise — no matter who is watching?",
    unlockHours: 0,
  },
  {
    number: 2,
    title: "The Comparison Trap",
    subtitle: "Seeing clearly through the noise",
    environment: "shattered-mirror",
    scriptureRef: "Romans 12:2",
    scripture:
      "Do not conform to the pattern of this world, but be transformed by the renewing of your mind.",
    prompt:
      "What is one thing you have pretended to be because of what you saw online or around you?",
    unlockHours: 24,
  },
  {
    number: 3,
    title: "Your Design",
    subtitle: "Gifts that were put there on purpose",
    environment: "light-cathedral",
    scriptureRef: "Ephesians 2:10",
    scripture:
      "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
    prompt:
      "What comes naturally to you that others seem to struggle with? What do people consistently ask you for?",
    unlockHours: 24,
  },
  {
    number: 4,
    title: "Your Community",
    subtitle: "Who you bring with you matters",
    environment: "gathering-space",
    scriptureRef: "Proverbs 27:17",
    scripture:
      "As iron sharpens iron, so one person sharpens another.",
    prompt:
      "Describe the kind of person you want beside you on this journey. What do they bring that you lack?",
    unlockHours: 24,
  },
  {
    number: 5,
    title: "The Path Forward",
    subtitle: "Purpose is a direction, not a destination",
    environment: "horizon-overlook",
    scriptureRef: "Jeremiah 29:11",
    scripture:
      "For I know the plans I have for you, declares the Lord — plans to prosper you and not to harm you, plans to give you hope and a future.",
    prompt:
      "In five years, what does a fully-formed version of you look like? What are you doing? Who are you serving?",
    unlockHours: 24,
  },
] as const;

export type ChapterNumber = 1 | 2 | 3 | 4 | 5;

export async function getJourneyProgress(userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("journey_progress")
    .select("chapter_number, started_at, completed_at, unlocked_at")
    .eq("user_id", userId)
    .order("chapter_number");

  if (error) throw error;
  return data;
}

export async function isChapterUnlocked(
  userId: string,
  chapterNumber: ChapterNumber,
  supabase: SupabaseClient
): Promise<{ unlocked: boolean; unlocksAt: Date | null }> {
  if (chapterNumber === 1) return { unlocked: true, unlocksAt: null };

  const { data: prevChapter } = await supabase
    .from("journey_progress")
    .select("completed_at")
    .eq("user_id", userId)
    .eq("chapter_number", chapterNumber - 1)
    .single();

  if (!prevChapter?.completed_at) return { unlocked: false, unlocksAt: null };

  const completedAt = new Date(prevChapter.completed_at);
  const unlocksAt = new Date(completedAt.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();

  return {
    unlocked: now >= unlocksAt,
    unlocksAt: now < unlocksAt ? unlocksAt : null,
  };
}

export async function startChapter(
  userId: string,
  chapterNumber: ChapterNumber,
  supabase: SupabaseClient
): Promise<void> {
  const { error } = await supabase.from("journey_progress").upsert(
    {
      user_id: userId,
      chapter_number: chapterNumber,
      started_at: new Date().toISOString(),
      unlocked_at: new Date().toISOString(),
    },
    { onConflict: "user_id,chapter_number", ignoreDuplicates: true }
  );

  if (error) throw error;
}

export async function completeChapter(
  userId: string,
  chapterNumber: ChapterNumber,
  supabase: SupabaseClient
): Promise<void> {
  const { error } = await supabase
    .from("journey_progress")
    .update({ completed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("chapter_number", chapterNumber)
    .is("completed_at", null);

  if (error) throw error;
}
