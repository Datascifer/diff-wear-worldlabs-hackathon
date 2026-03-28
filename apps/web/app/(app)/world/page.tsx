import { ExperienceCard } from "@/components/world/experience-card";
import { createClient } from "@/lib/supabase/server";
import { assertAuthenticated, resolveAgeTier } from "../../../../../services/auth";

export default async function WorldLandingPage() {
  const supabase = createClient();
  const user = await assertAuthenticated(supabase);
  const ageTier = await resolveAgeTier(user.id, supabase);
  const isCampfireLocked = ageTier !== "young_adult";

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <h1 className="text-3xl font-bold text-white">World Experiences</h1>
      <p className="text-sm text-white/70">Private spiritual spaces and guided journeys built with World Labs.</p>

      <ExperienceCard
        title="Prayer Room"
        description="A private meditative space with breathing guidance and scripture."
        href="/world/prayer"
        availability="✅ All ages"
      />

      <ExperienceCard
        title="Identity Journey"
        description="Five chapter reflection journey calibrated for ages 16–19 and available to all users."
        href="/world/journey"
        availability="✅ All ages (calibrated for 16–19)"
      />

      <ExperienceCard
        title="Community Campfire"
        description="Adults-only spatial gathering with LiveKit proximity audio and human moderation."
        href="/world/campfire"
        availability={isCampfireLocked ? "❌ Adults only (18+) — Unlocks at 18" : "✅ Adults only (18+)"}
        locked={isCampfireLocked}
      />
    </div>
  );
}
