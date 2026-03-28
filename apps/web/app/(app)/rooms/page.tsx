import { RoomCard } from "@/components/rooms/room-card";
import type { RoomType, RoomStatus } from "@/types/domain";

const PREVIEW_ROOMS: Array<{
  id: string;
  title: string;
  topic: string;
  room_type: RoomType;
  status: RoomStatus;
  speakerCount: number;
  listenerCount: number;
  isLocked: boolean;
}> = [
  {
    id: "1",
    title: "Morning Devotional",
    topic: "Starting the day with intention and prayer",
    room_type: "all_ages_moderated",
    status: "scheduled",
    speakerCount: 0,
    listenerCount: 0,
    isLocked: false,
  },
  {
    id: "2",
    title: "Faith & Fitness Talk",
    topic: "How movement strengthens your spiritual life",
    room_type: "all_ages_moderated",
    status: "scheduled",
    speakerCount: 0,
    listenerCount: 0,
    isLocked: false,
  },
  {
    id: "3",
    title: "NYC Young Adults",
    topic: "Open conversation for 18-25 in New York City",
    room_type: "adults_only",
    status: "scheduled",
    speakerCount: 0,
    listenerCount: 0,
    isLocked: true,
  },
];

export default function RoomsPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        >
          Rooms
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
          Live voice conversation
        </p>
      </div>

      {/* Phase 2 banner */}
      <div
        className="rounded-lg p-5 space-y-2"
        style={{
          background: "rgba(168,85,255,0.08)",
          border: "1px solid rgba(168,85,255,0.20)",
        }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Voice Rooms are on the way
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
          Moderated live audio around faith, fitness, and community. Every room has a trained moderator.
        </p>
        <span
          className="inline-block text-xs px-3 py-1 rounded-full font-semibold"
          style={{
            background: "rgba(168,85,255,0.15)",
            color: "var(--color-accent-purple)",
            border: "1px solid rgba(168,85,255,0.25)",
          }}
        >
          Phase 2
        </span>
      </div>

      <div>
        <h2
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.10em" }}
        >
          Planned Room Types
        </h2>
        <div className="space-y-3">
          {PREVIEW_ROOMS.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>
    </div>
  );
}
