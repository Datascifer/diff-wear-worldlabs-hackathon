import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  // Only accept POST from pg_cron / internal calls
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const today = new Date();
  const birthdayThisYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Find users turning 18 today
  // date_of_birth format: YYYY-MM-DD
  // If today is their 18th birthday: (today.year - dob.year = 18) AND same MM-DD
  const { data: turningAdults, error } = await supabase
    .from("users")
    .select("id, display_name")
    .eq("age_tier", "minor")
    .like("date_of_birth", `%-${birthdayThisYear.substring(5)}`); // match MM-DD

  if (error) {
    console.error("[birthday-recalculation] Query failed:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Filter to users exactly 18 years old today
  const eligible = (turningAdults ?? []).filter((user) => {
    const dobYear = parseInt((user.date_of_birth as string).substring(0, 4), 10);
    return today.getFullYear() - dobYear === 18;
  });

  const upgraded: string[] = [];

  for (const user of eligible) {
    const { error: updateError } = await supabase
      .from("users")
      .update({ age_tier: "young_adult" })
      .eq("id", user.id);

    if (updateError) {
      console.error(`[birthday-recalculation] Failed to upgrade ${user.id as string}:`, updateError.message);
    } else {
      upgraded.push(user.id as string);
      console.log(`[birthday-recalculation] Upgraded user ${user.id as string} (${user.display_name as string}) to young_adult`);
    }
  }

  const result = {
    upgraded_count: upgraded.length,
    user_ids: upgraded,
    timestamp: new Date().toISOString(),
  };

  console.log("[birthday-recalculation] Complete:", result);

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
});
