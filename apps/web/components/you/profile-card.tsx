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
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const initial = profile.display_name.charAt(0).toUpperCase();

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-glass-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--color-glass-border)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* Aurora top band */}
      <div
        aria-hidden="true"
        className="h-20 w-full"
        style={{ background: "var(--gradient-aurora)" }}
      />

      <div className="px-5 pb-6">
        {/* Avatar — offset from band */}
        <div className="-mt-10 mb-4">
          {/* Prism ring wrapper */}
          <div
            className="inline-block rounded-full"
            style={{
              padding: "2.5px",
              background: "var(--gradient-aurora)",
              borderRadius: "50%",
            }}
          >
            <div
              className="rounded-full"
              style={{
                padding: "2px",
                background: "var(--color-bg-base)",
                borderRadius: "50%",
              }}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={`${profile.display_name}'s avatar`}
                  className="w-20 h-20 rounded-full object-cover block"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #7B2FFF, #4040FF)" }}
                  aria-label={`${profile.display_name}'s avatar`}
                >
                  {initial}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Identity */}
        <div className="space-y-1 mb-5">
          <h2
            className="text-xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            {profile.display_name}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {profile.city && (
              <span className="text-sm flex items-center gap-1" style={{ color: "var(--color-text-tertiary)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                </svg>
                {profile.city} area
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Member since {memberSince}
          </p>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-3 gap-px rounded-lg overflow-hidden mb-5"
          style={{ background: "var(--color-border-default)" }}
          role="list"
          aria-label="Profile statistics"
        >
          {[
            { label: "Streak", value: `${stats.streak}d` },
            { label: "Posts",  value: String(stats.posts) },
            { label: "Rooms",  value: String(stats.connections) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="text-center py-4"
              style={{ background: "var(--color-bg-surface)" }}
              role="listitem"
            >
              <span
                className="block text-2xl font-black"
                style={{
                  fontFamily: "var(--font-display)",
                  background: "var(--gradient-flame)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {value}
              </span>
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.08em" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-2">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.08em" }}
            >
              Badges
            </p>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge key={badge.slug} earned={true} icon={badge.icon} label={badge.name} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
