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
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Rooms
        </h1>
        <p className="text-white/50 text-sm">
          Live voice conversation — coming soon.
        </p>
      </div>

      {/* Phase 2 banner */}
      <div
        className="rounded-3xl p-5 text-center space-y-2"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,60,172,0.12), rgba(123,47,255,0.12))",
          border: "1px solid rgba(255,60,172,0.25)",
        }}
      >
        <div className="text-3xl">🎙️</div>
        <h3 className="text-white font-semibold">Voice Rooms are on the way</h3>
        <p className="text-white/50 text-sm leading-relaxed">
          Join moderated live audio conversations around faith, fitness, and
          community. Every room has a trained moderator.
        </p>
        <span
          className="inline-block text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: "rgba(255,60,172,0.2)", color: "#f9a8d4" }}
        >
          Phase 2
        </span>
      </div>

      <div>
        <h2 className="text-white/60 text-xs uppercase tracking-widest mb-3">
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
