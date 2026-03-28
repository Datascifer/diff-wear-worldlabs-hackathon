import type { RoomType, RoomStatus } from "@/types/domain";

interface RoomCardProps {
  room: {
    id: string;
    title: string;
    topic: string | null;
    room_type: RoomType;
    status: RoomStatus;
    speakerCount: number;
    listenerCount: number;
    isLocked: boolean;
  };
}

const ROOM_META: Record<RoomType, { audienceLabel: string; audienceColor: string; audienceBg: string }> = {
  all_ages_moderated: {
    audienceLabel: "All ages",
    audienceColor: "#4DA6FF",
    audienceBg:    "rgba(77,166,255,0.15)",
  },
  adults_only: {
    audienceLabel: "18+",
    audienceColor: "#FF6B00",
    audienceBg:    "rgba(255,107,0,0.15)",
  },
};

export function RoomCard({ room }: RoomCardProps) {
  const meta = ROOM_META[room.room_type];
  const isModerated = room.room_type === "all_ages_moderated";
  const isLive = room.status === "live";

  return (
    <div
      className="rounded-lg p-5 space-y-3"
      style={{
        background: "var(--color-glass-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: isLive
          ? "1px solid rgba(0,217,126,0.25)"
          : "1px solid var(--color-glass-border)",
        boxShadow: isLive
          ? "0 0 0 1px rgba(0,217,126,0.12), var(--shadow-md)"
          : "var(--shadow-md)",
        opacity: room.isLocked ? 0.5 : 1,
      }}
    >
      {/* Chips row */}
      <div className="flex items-center gap-2 flex-wrap">
        {isLive && (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
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

        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: meta.audienceBg,
            color: meta.audienceColor,
            border: `1px solid ${meta.audienceColor}40`,
          }}
        >
          {meta.audienceLabel}
        </span>

        {isModerated && (
          <span
            className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
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
            Staff led
          </span>
        )}

        {room.isLocked && (
          <span
            aria-label="Access restricted — 18+ only"
            style={{ color: "var(--color-text-disabled)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </span>
        )}
      </div>

      {/* Title + topic */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {room.title}
        </h3>
        {room.topic && (
          <p className="text-xs leading-snug" style={{ color: "var(--color-text-tertiary)" }}>
            {room.topic}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2"/>
            </svg>
            {room.speakerCount}
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            {room.listenerCount}
          </span>
        </div>

        {!room.isLocked && (
          <button
            className="h-8 px-4 rounded-full text-xs font-semibold transition-all active:scale-95"
            style={{
              background: isLive ? "var(--gradient-flame)" : "var(--color-bg-elevated)",
              color: isLive ? "#fff" : "var(--color-text-secondary)",
              border: isLive ? "none" : "1px solid var(--color-border-default)",
              boxShadow: isLive ? "0 0 16px rgba(255,107,0,0.30)" : "none",
            }}
          >
            {isLive ? (isModerated ? "Join (moderated)" : "Join") : "Notify me"}
          </button>
        )}
      </div>
    </div>
  );
}
