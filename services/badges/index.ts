import type { SupabaseClient } from "@supabase/supabase-js";

// The date the platform launched — used for 'founding_member' badge.
const FOUNDING_DATE = new Date("2025-09-01");
const FOUNDING_WINDOW_DAYS = 90;

interface BadgeCondition {
  slug: string;
  check: (userId: string, supabase: SupabaseClient) => Promise<boolean>;
}

const BADGE_CONDITIONS: BadgeCondition[] = [
  {
    slug: "first_post",
    check: async (userId, supabase) => {
      const { count } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", userId)
        .eq("moderation_status", "approved");
      return (count ?? 0) >= 1;
    },
  },
  {
    slug: "streak_7",
    check: async (userId, supabase) => {
      const { data } = await supabase
        .from("streaks")
        .select("current_count")
        .eq("user_id", userId)
        .gte("current_count", 7);
      return (data?.length ?? 0) > 0;
    },
  },
  {
    slug: "streak_30",
    check: async (userId, supabase) => {
      const { data } = await supabase
        .from("streaks")
        .select("longest_count")
        .eq("user_id", userId)
        .gte("longest_count", 30);
      return (data?.length ?? 0) > 0;
    },
  },
  {
    slug: "faith_walk_21",
    check: async (userId, supabase) => {
      const { data } = await supabase
        .from("streaks")
        .select("longest_count")
        .eq("user_id", userId)
        .eq("streak_type", "devotional")
        .gte("longest_count", 21);
      return (data?.length ?? 0) > 0;
    },
  },
  {
    slug: "iron_soul_50",
    check: async (userId, supabase) => {
      const { count } = await supabase
        .from("move_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      return (count ?? 0) >= 50;
    },
  },
  {
    slug: "community_voice",
    check: async (userId, supabase) => {
      const { count } = await supabase
        .from("post_reactions")
        .select("id", { count: "exact", head: true })
        .eq("reaction_type", "like")
        .in(
          "post_id",
          (
            await supabase
              .from("posts")
              .select("id")
              .eq("author_id", userId)
          ).data?.map((p: { id: string }) => p.id) ?? []
        );
      return (count ?? 0) >= 10;
    },
  },
  {
    slug: "founding_member",
    check: async (userId, supabase) => {
      const { data } = await supabase
        .from("users")
        .select("created_at")
        .eq("id", userId)
        .single();
      if (!data) return false;
      const createdAt = new Date(data.created_at as string);
      const cutoff = new Date(
        FOUNDING_DATE.getTime() + FOUNDING_WINDOW_DAYS * 24 * 60 * 60 * 1000
      );
      return createdAt <= cutoff;
    },
  },
];

// evaluateAndAwardBadges — checks all badge conditions and inserts any newly earned ones.
// Returns the slugs of newly awarded badges.
export async function evaluateAndAwardBadges(
  userId: string,
  supabase: SupabaseClient
): Promise<string[]> {
  // Get badge IDs for all slugs
  const { data: badges } = await supabase
    .from("badges")
    .select("id, slug");

  if (!badges?.length) return [];

  // Get already-earned badge slugs
  const { data: earned } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  const earnedIds = new Set((earned ?? []).map((e: { badge_id: string }) => e.badge_id));
  const badgeMap = new Map(badges.map((b: { id: string; slug: string }) => [b.slug, b.id]));

  const newlyEarned: string[] = [];

  for (const condition of BADGE_CONDITIONS) {
    const badgeId = badgeMap.get(condition.slug);
    if (!badgeId) continue;
    if (earnedIds.has(badgeId)) continue; // already earned

    const earned = await condition.check(userId, supabase);
    if (earned) {
      const { error } = await supabase
        .from("user_badges")
        .insert({ user_id: userId, badge_id: badgeId });
      if (!error) {
        newlyEarned.push(condition.slug);
      }
    }
  }

  return newlyEarned;
}
