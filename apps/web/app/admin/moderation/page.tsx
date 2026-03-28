import { createClient } from "@/lib/supabase/server";
import ModerationQueue from "./queue";

export default async function ModerationPage() {
  const supabase = createClient();

  const { data: flags } = await supabase
    .from("moderation_flags")
    .select(
      "id, content_type, content_id, reason, status, scores, created_at, flagged_by:users!flagged_by(display_name)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(50);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1
          className="text-xl font-bold text-white"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Moderation Queue
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {flags?.length ?? 0} pending item{flags?.length !== 1 ? "s" : ""}
        </p>
      </div>
      <ModerationQueue flags={flags ?? []} />
    </div>
  );
}
