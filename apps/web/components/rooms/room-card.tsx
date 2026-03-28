import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { RoomType, RoomStatus } from "@/types/domain";

type GradientName = "solar" | "cosmic" | "aurora" | "divine" | "flame";

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

const ROOM_TYPE_META: Record<
  RoomType,
  { gradient: GradientName; label: string }
> = {
  all_ages_moderated: { gradient: "cosmic", label: "All Ages" },
  adults_only: { gradient: "aurora", label: "18+" },
};

export function RoomCard({ room }: RoomCardProps) {
  const meta = ROOM_TYPE_META[room.room_type];

  return (
    <Card
      gradient={meta.gradient}
      className={cn(room.isLocked ? "opacity-50" : "")}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {room.status === "live" && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider"
                  style={{
                    background: "rgba(255,23,68,0.3)",
                    color: "#ff6b8a",
                    border: "1px solid rgba(255,23,68,0.4)",
                  }}
                >
                  LIVE
                </span>
              )}
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                {meta.label}
              </span>
              {room.isLocked && (
                <span
                  className="text-white/40 text-sm"
                  aria-label="Access restricted"
                  title="You need to be 18+ to join this room"
                >
                  🔒
                </span>
              )}
            </div>
            <h3 className="text-white font-semibold text-sm">{room.title}</h3>
            {room.topic && (
              <p className="text-white/50 text-xs mt-0.5 leading-snug">
                {room.topic}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-white/40 text-xs">
          <span>🎙️ {room.speakerCount} speakers</span>
          <span>👂 {room.listenerCount} listeners</span>
        </div>
      </div>
    </Card>
  );
}
