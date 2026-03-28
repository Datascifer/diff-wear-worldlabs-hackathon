import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import type { Badge as BadgeType } from "@/types/domain";

interface ProfileStats {
  streak: number;
  posts: number;
  connections: number;
}

interface ProfileData {
  id: string;
  display_name: string;
  city: string | null;
  age_tier: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface ProfileCardProps {
  profile: ProfileData;
  badges: BadgeType[];
  stats: ProfileStats;
}

export function ProfileCard({ profile, badges, stats }: ProfileCardProps) {
  const memberSince = new Date(profile.created_at).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );
  const ageTierLabel = profile.age_tier === "minor" ? "16–17" : "18–25";
  const initial = profile.display_name.charAt(0).toUpperCase();

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Hero gradient band */}
      <div
        className="h-24 w-full"
        style={{
          background:
            "linear-gradient(135deg, #7B2FFF 0%, #0057FF 50%, #FF3CAC 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className="px-5 pb-5"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        {/* Avatar */}
        <div className="-mt-10 mb-4">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={`${profile.display_name}'s avatar`}
              className="w-20 h-20 rounded-full border-4 object-cover"
              style={{ borderColor: "#0a0012" }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold text-white"
              style={{
                borderColor: "#0a0012",
                background: "linear-gradient(135deg, #7B2FFF, #0057FF)",
              }}
              aria-label={`${profile.display_name}'s avatar`}
            >
              {initial}
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="space-y-1 mb-4">
          <h2
            className="text-white font-bold text-xl"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {profile.display_name}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {profile.city && (
              <span className="text-white/50 text-sm">📍 {profile.city}</span>
            )}
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(123,47,255,0.2)",
                color: "#a78bfa",
                border: "1px solid rgba(123,47,255,0.3)",
              }}
            >
              {ageTierLabel}
            </span>
          </div>
          {profile.bio && (
            <p className="text-white/60 text-sm leading-relaxed pt-1">
              {profile.bio}
            </p>
          )}
          <p className="text-white/30 text-xs">Member since {memberSince}</p>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-3 gap-2 mb-4 rounded-2xl p-3"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {[
            { label: "Streak", value: stats.streak, suffix: "d" },
            { label: "Posts", value: stats.posts, suffix: "" },
            { label: "Connected", value: stats.connections, suffix: "" },
          ].map(({ label, value, suffix }) => (
            <div key={label} className="text-center">
              <span
                className="block text-xl font-black"
                style={{
                  background: "linear-gradient(135deg, #FFD600, #FF6B00)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {value}
                {suffix}
              </span>
              <span className="text-white/40 text-xs">{label}</span>
            </div>
          ))}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
              Badges
            </p>
            <div className={cn("flex flex-wrap gap-1")}>
              {badges.map((badge) => (
                <Badge
                  key={badge.slug}
                  earned={true}
                  icon={badge.icon}
                  label={badge.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
