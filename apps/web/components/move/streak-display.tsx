function getStreakMessage(streak: number): string {
  if (streak === 0)   return "Start your journey today";
  if (streak === 1)   return "First step taken. Keep going.";
  if (streak < 7)     return "Building momentum";
  if (streak < 14)    return "One week strong";
  if (streak < 30)    return "Consistency is character";
  if (streak < 50)    return "Month of discipline";
  return "Iron soul. Keep forging.";
}

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  const isActive = currentStreak > 0;
  // 7-day week dots: true = completed
  const weekDots = Array.from({ length: 7 }, (_, i) => i < (currentStreak % 7 || (isActive ? 7 : 0)));

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(255,107,0,0.12), rgba(232,0,61,0.12))"
          : "var(--color-bg-surface)",
        border: isActive
          ? "1px solid rgba(255,107,0,0.30)"
          : "1px solid var(--color-border-default)",
        boxShadow: isActive ? "var(--shadow-glow-yellow)" : "none",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <span
            className="block text-5xl font-black leading-none"
            style={{
              fontFamily: "var(--font-display)",
              background: isActive ? "var(--gradient-flame)" : "var(--color-text-disabled)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            aria-label={`${currentStreak} day streak`}
          >
            {currentStreak}
          </span>
          <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.08em" }}>
            day streak
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm italic" style={{ color: "var(--color-text-secondary)" }}>
            {getStreakMessage(currentStreak)}
          </p>
          {longestStreak > currentStreak && (
            <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
              Best: {longestStreak}d
            </p>
          )}
        </div>
      </div>

      {/* 7-day dots */}
      <div className="flex gap-1.5" aria-label="Weekly activity" role="list">
        {weekDots.map((done, i) => (
          <div
            key={i}
            role="listitem"
            className="flex-1 h-1.5 rounded-full"
            style={{
              background: done
                ? "var(--gradient-flame)"
                : "var(--color-border-default)",
            }}
            aria-label={done ? `Day ${i + 1} complete` : `Day ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
