import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = createClient();

  const { data: users } = await supabase
    .from("users")
    .select("id, display_name, age_tier, account_status, created_at, city")
    .order("created_at", { ascending: false })
    .limit(100);

  const statusColors: Record<string, { bg: string; color: string }> = {
    active: { bg: "rgba(0,213,132,0.15)", color: "#00D584" },
    pending_consent: { bg: "rgba(255,214,0,0.15)", color: "#FFD600" },
    suspended: { bg: "rgba(255,107,0,0.15)", color: "#FF6B00" },
    banned: { bg: "rgba(255,23,68,0.15)", color: "#FF1744" },
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1
          className="text-xl font-bold text-white"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Users
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {users?.length ?? 0} most recent
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)" }}>
              <th className="text-left text-white/40 text-xs px-4 py-3 font-medium">Name</th>
              <th className="text-left text-white/40 text-xs px-4 py-3 font-medium">Age Tier</th>
              <th className="text-left text-white/40 text-xs px-4 py-3 font-medium">Status</th>
              <th className="text-left text-white/40 text-xs px-4 py-3 font-medium">City</th>
              <th className="text-left text-white/40 text-xs px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user, i) => {
              const statusStyle = statusColors[user.account_status as string] ?? statusColors.active;
              return (
                <tr
                  key={user.id as string}
                  style={{
                    borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined,
                  }}
                >
                  <td className="px-4 py-3 text-white">{user.display_name as string}</td>
                  <td className="px-4 py-3 text-white/60">{user.age_tier as string}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={statusStyle}
                    >
                      {user.account_status as string}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40">{(user.city as string | null) ?? "—"}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {new Date(user.created_at as string).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
