import { createClient } from "@/lib/supabase/server";
import { StreakDisplay } from "@/components/move/streak-display";
import { WorkoutCard } from "@/components/move/workout-card";
import type { PlanType } from "@/types/domain";

const SAMPLE_PLANS: Array<{
  id: string;
  title: string;
  plan_type: PlanType;
  duration_minutes: number;
  scripture_reference: string;
}> = [
  {
    id: "1",
    title: "Morning Breathwork",
    plan_type: "breathwork",
    duration_minutes: 10,
    scripture_reference: "Psalm 150:6",
  },
  {
    id: "2",
    title: "Upper Body Strength",
    plan_type: "strength",
    duration_minutes: 30,
    scripture_reference: "1 Corinthians 6:19-20",
  },
  {
    id: "3",
    title: "Evening Walk & Reflect",
    plan_type: "cardio",
    duration_minutes: 20,
    scripture_reference: "Micah 6:8",
  },
  {
    id: "4",
    title: "Flexibility & Stillness",
    plan_type: "flexibility",
    duration_minutes: 15,
    scripture_reference: "Psalm 46:10",
  },
];

export default async function MovePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: streak } = await supabase
    .from("streaks")
    .select("current_count, longest_count, last_activity_date")
    .eq("user_id", user.id)
    .eq("streak_type", "move")
    .single();

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Move
        </h1>
        <p className="text-white/50 text-sm">
          Honor your body. Strengthen your spirit.
        </p>
      </div>

      <StreakDisplay
        currentStreak={streak?.current_count ?? 0}
        longestStreak={streak?.longest_count ?? 0}
      />

      <div>
        <h2 className="text-white/60 text-xs uppercase tracking-widest mb-3">
          Today&apos;s Plans
        </h2>
        <div className="space-y-3">
          {SAMPLE_PLANS.map((plan) => (
            <WorkoutCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>

      {/* World Labs teaser */}
      <div
        className="rounded-3xl p-5 text-center space-y-2"
        style={{
          background:
            "linear-gradient(135deg, rgba(123,47,255,0.15), rgba(0,87,255,0.15))",
          border: "1px solid rgba(123,47,255,0.3)",
        }}
      >
        <div className="text-2xl">🌍</div>
        <h3 className="text-white font-semibold">World Labs</h3>
        <p className="text-white/50 text-sm leading-relaxed">
          City-wide fitness challenges, group workouts, and community events —
          coming soon.
        </p>
        <span
          className="inline-block text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: "rgba(123,47,255,0.3)", color: "#a78bfa" }}
        >
          Coming Soon
        </span>
      </div>
    </div>
  );
}
