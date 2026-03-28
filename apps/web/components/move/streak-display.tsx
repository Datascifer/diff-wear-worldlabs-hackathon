function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your journey today";
  if (streak === 1) return "First step taken. Keep going.";
  if (streak < 7) return "Building momentum";
  if (streak < 14) return "One week strong";
  if (streak < 30) return "Consistency is character";
  if (streak < 50) return "Month of discipline";
  return "Iron soul. Keep forging.";
}

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
}: StreakDisplayProps) {
  const isActive = currentStreak > 0;

  return (
    <div
      className="rounded-3xl p-6 text-center space-y-3 relative overflow-hidden"
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(255,107,0,0.2), rgba(255,23,68,0.2))"
          : "rgba(255,255,255,0.04)",
        border: isActive
          ? "1px solid rgba(255,107,0,0.4)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {isActive && (
        <div
          className="text-4xl"
          style={{ animation: "pulseGlow 2s ease-in-out infinite" }}
          aria-hidden="true"
        >
          🔥
        </div>
      )}

      <div>
        <span
          className="text-6xl font-black block leading-none"
          style={
            isActive
              ? {
                  background: "linear-gradient(135deg, #FFD600, #FF6B00)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }
              : { color: "rgba(255,255,255,0.2)" }
          }
          aria-label={`${currentStreak} day streak`}
        >
          {currentStreak}
        </span>
        <p className="text-white/50 text-sm mt-1">day streak</p>
      </div>

      <p className="text-white/70 text-sm italic">
        {getStreakMessage(currentStreak)}
      </p>

      {longestStreak > currentStreak && (
        <p className="text-white/30 text-xs">Best: {longestStreak} days</p>
      )}
    </div>
  );
}
