import { createClient } from "@/lib/supabase/server";
import { ProfileCard } from "@/components/you/profile-card";
import { NotificationSettings } from "@/components/you/notification-settings";
import type { Badge } from "@/types/domain";

export default async function YouPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, display_name, city, age_tier, avatar_url, bio, created_at")
    .eq("id", user.id)
    .single();

  const { data: badgeRows } = await supabase
    .from("user_badges")
    .select("earned_at, badge:badges(slug, name, icon, description)")
    .eq("user_id", user.id);

  const { count: postCount } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id)
    .eq("moderation_status", "approved");

  const { data: streak } = await supabase
    .from("streaks")
    .select("current_count")
    .eq("user_id", user.id)
    .eq("streak_type", "move")
    .single();

  const badges: Badge[] =
    badgeRows
      ?.map((b) => b.badge)
      .filter((b): b is NonNullable<typeof b> => b !== null) ?? [];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <ProfileCard
        profile={
          profile ?? {
            id: user.id,
            display_name: "Anonymous",
            city: null,
            age_tier: "young_adult",
            avatar_url: null,
            bio: null,
            created_at: new Date().toISOString(),
          }
        }
        badges={badges}
        stats={{
          streak: streak?.current_count ?? 0,
          posts: postCount ?? 0,
          connections: 0,
        }}
      />
      <NotificationSettings />
    </div>
  );
}
