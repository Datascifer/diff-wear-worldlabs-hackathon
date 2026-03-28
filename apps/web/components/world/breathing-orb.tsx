interface BreathingOrbProps {
  size?: number;
  color?: string;
  glowColor?: string;
  duration?: number;
  rings?: number;
}

export function BreathingOrb({
  size = 120,
  color = "rgba(0,87,255,0.6)",
  glowColor = "rgba(123,47,255,0.4)",
  duration = 4,
  rings = 3,
}: BreathingOrbProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), ${color})`,
          boxShadow: `0 0 48px ${glowColor}`,
          animation: `breathe ${duration}s ease-in-out infinite`,
        }}
      />

      {Array.from({ length: rings }).map((_, index) => {
        const ringSize = size + (index + 1) * 24;
        return (
          <div
            key={ringSize}
            className="absolute rounded-full border"
            style={{
              width: ringSize,
              height: ringSize,
              borderColor: glowColor,
              opacity: 0.32 - index * 0.08,
              animation: `breathe ${duration}s ease-in-out infinite`,
              animationDelay: `${index * 0.45}s`,
            }}
          />
        );
      })}

      <style jsx>{`
        @keyframes breathe {
          0% {
            transform: scale(0.85);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.85);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
