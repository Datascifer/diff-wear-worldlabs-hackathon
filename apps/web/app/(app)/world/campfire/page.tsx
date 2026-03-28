import { CampfireEnv } from "@/components/world/campfire-env";
import { createClient } from "@/lib/supabase/server";
import { assertAuthenticated, resolveAgeTier } from "../../../../../../services/auth";
import { getLiveParticipantCount } from "../../../../../../services/world-labs/campfire";

const DEFAULT_SESSION_ID = "00000000-0000-0000-0000-000000000001";

export default async function CampfirePage() {
  const supabase = createClient();
  const user = await assertAuthenticated(supabase);
  const ageTier = await resolveAgeTier(user.id, supabase);

  if (ageTier !== "young_adult") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-semibold text-white">Community Campfire</h1>
        <p className="mt-3 text-sm text-white/70">Campfire unlocks at age 18. Minors cannot access this experience.</p>
      </div>
    );
  }

  let participantCount = 0;
  try {
    participantCount = await getLiveParticipantCount(DEFAULT_SESSION_ID, supabase);
  } catch {
    participantCount = 0;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold text-white">Community Campfire</h1>
      <p className="text-sm text-white/70">Adults-only spatial audio circle with human moderation.</p>
      <CampfireEnv participantCount={participantCount} />
    </div>
  );
}
