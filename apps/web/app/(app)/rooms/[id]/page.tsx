import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function RoomEntryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: room } = await supabase
    .from("rooms")
    .select("id, title, topic, room_type, status, host_id, host:users(display_name, avatar_url)")
    .eq("id", params.id)
    .single();

  if (!room) notFound();

  const { data: profile } = await supabase
    .from("users")
    .select("age_tier, account_status")
    .eq("id", user.id)
    .single();

  // Minors cannot enter adults_only rooms (also enforced by RLS)
  if (
    profile?.age_tier === "minor" &&
    (room as unknown as { room_type: string }).room_type === "adults_only"
  ) {
    redirect("/rooms");
  }

  const r = room as unknown as {
    id: string;
    title: string;
    topic: string | null;
    room_type: string;
    status: string;
    host_id: string;
    host: { display_name: string; avatar_url: string | null } | null;
  };

  const isModerated = r.room_type === "all_ages_moderated";
  const isLive = r.status === "live";
  const hostName = r.host?.display_name ?? "Host";
  const hostInitial = hostName.charAt(0).toUpperCase();

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{ background: "var(--color-bg-base)" }}
    >
      {/* Ambient campfire glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 70% 40% at 50% 110%, rgba(255,107,0,0.25) 0%, transparent 70%)",
            "radial-gradient(ellipse 50% 30% at 50% 100%, rgba(232,0,61,0.15) 0%, transparent 60%)",
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(107,31,255,0.15) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Header */}
      <header
        className="relative z-10 flex items-center gap-3 px-4 py-4"
        style={{
          background: "var(--color-glass-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--color-border-default)",
        }}
      >
        <Link
          href="/rooms"
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
          style={{
            background: "var(--color-bg-elevated)",
            color: "var(--color-text-secondary)",
          }}
          aria-label="Leave room"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>

        <div className="flex-1 min-w-0">
          <h1
            className="text-sm font-semibold truncate"
            style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}
          >
            {r.title}
          </h1>
          {r.topic && (
            <p className="text-xs truncate" style={{ color: "var(--color-text-tertiary)" }}>
              {r.topic}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLive && (
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full"
              style={{
                background: "rgba(0,217,126,0.15)",
                color: "var(--color-success)",
                border: "1px solid rgba(0,217,126,0.30)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-live-pulse inline-block"
                style={{ background: "var(--color-success)" }}
                aria-hidden="true"
              />
              Live
            </span>
          )}
          {isModerated && (
            <span
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
              style={{
                background: "rgba(168,85,255,0.10)",
                color: "var(--color-accent-purple)",
                border: "1px solid rgba(168,85,255,0.25)",
              }}
              aria-label="Staff moderated room"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Moderated
            </span>
          )}
        </div>
      </header>

      {/* Stage — speaker orbs */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 px-8 py-12">
        {/* Host orb */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white relative"
            style={{
              background: "linear-gradient(135deg, #7B2FFF, #4040FF)",
              boxShadow: "0 0 0 3px rgba(107,31,255,0.25), 0 0 40px rgba(107,31,255,0.20)",
            }}
            aria-label={`Host: ${hostName}`}
          >
            {r.host?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.host.avatar_url}
                alt={hostName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              hostInitial
            )}
            {/* Crown */}
            <span
              className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm"
              aria-hidden="true"
            >
              👑
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              {hostName}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Host</p>
          </div>
        </div>

        {!isLive && (
          <div
            className="text-center space-y-2 rounded-xl px-6 py-4"
            style={{
              background: "var(--color-glass-bg)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--color-glass-border)",
            }}
          >
            <p
              className="text-base font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
            >
              Room not started yet
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              You&apos;ll be notified when the host begins.
            </p>
          </div>
        )}
      </main>

      {/* Controls bar */}
      <footer
        className="relative z-10 safe-bottom px-6 py-5"
        style={{
          background: "var(--color-glass-bg)",
          backdropFilter: "blur(var(--blur-lg))",
          WebkitBackdropFilter: "blur(var(--blur-lg))",
          borderTop: "1px solid var(--color-border-default)",
        }}
      >
        <div className="flex items-center justify-center gap-6 max-w-lg mx-auto">
          {/* Mute */}
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-default)",
              color: "var(--color-text-secondary)",
            }}
            aria-label="Toggle mute"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
            </svg>
          </button>

          {/* Leave */}
          <Link
            href="/rooms"
            className="h-12 px-6 rounded-full flex items-center justify-center text-sm font-semibold transition-all active:scale-95"
            style={{
              background: "rgba(232,0,61,0.15)",
              color: "var(--color-error)",
              border: "1px solid rgba(232,0,61,0.25)",
            }}
          >
            Leave quietly
          </Link>

          {/* Hand raise */}
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-default)",
              color: "var(--color-text-secondary)",
            }}
            aria-label="Raise hand"
          >
            <span aria-hidden="true" style={{ fontSize: "18px" }}>✋</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
