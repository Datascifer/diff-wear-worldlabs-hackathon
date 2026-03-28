import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86400000);
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 86400000);

  // Get all users who have move logs in the last 60 days
  const { data: activeUsers, error: usersError } = await supabase
    .from("move_logs")
    .select("user_id")
    .gte("completed_at", sixtyDaysAgo.toISOString())
    .limit(10000);

  if (usersError) {
    console.error("[streak-recalculation] Failed to fetch users:", usersError.message);
    return new Response(JSON.stringify({ error: usersError.message }), { status: 500 });
  }

  const userIds = [...new Set((activeUsers ?? []).map((r) => r.user_id as string))];
  let processedCount = 0;

  for (const userId of userIds) {
    // Fetch last 60 days of logs
    const { data: logs } = await supabase
      .from("move_logs")
      .select("completed_at")
      .eq("user_id", userId)
      .gte("completed_at", sixtyDaysAgo.toISOString())
      .order("completed_at", { ascending: false });

    if (!logs?.length) continue;

    // Get unique dates (YYYY-MM-DD) from logs
    const datestamps = new Set(
      logs.map((l) => new Date(l.completed_at as string).toISOString().substring(0, 10))
    );

    const sortedDates = [...datestamps].sort().reverse();

    // Calculate current streak (consecutive days ending today or yesterday)
    let currentStreak = 0;
    const checkFrom = today.toISOString().substring(0, 10);
    const checkYesterday = yesterday.toISOString().substring(0, 10);

    if (datestamps.has(checkFrom) || datestamps.has(checkYesterday)) {
      let streak = 0;
      let cursor = datestamps.has(checkFrom)
        ? new Date(today)
        : new Date(yesterday);

      while (datestamps.has(cursor.toISOString().substring(0, 10))) {
        streak++;
        cursor = new Date(cursor.getTime() - 86400000);
      }
      currentStreak = streak;
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const curr = new Date(sortedDates[i]!);
      const next = new Date(sortedDates[i + 1]!);
      const diffDays = Math.round((curr.getTime() - next.getTime()) / 86400000);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    const lastActivityDate = sortedDates[0] ?? null;

    await supabase
      .from("streaks")
      .upsert(
        {
          user_id: userId,
          streak_type: "move",
          current_count: currentStreak,
          longest_count: longestStreak,
          last_activity_date: lastActivityDate,
        },
        { onConflict: "user_id,streak_type" }
      );

    processedCount++;
  }

  const result = { processed_count: processedCount, timestamp: new Date().toISOString() };
  console.log("[streak-recalculation] Complete:", result);

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
});
