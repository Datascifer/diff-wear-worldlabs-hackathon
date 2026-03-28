interface FloatingScriptureProps {
  verse: string;
  reference: string;
  opacity?: number;
}

export function FloatingScripture({
  verse,
  reference,
  opacity = 0.55,
}: FloatingScriptureProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center px-6 text-center pointer-events-none"
      style={{ opacity }}
    >
      <div className="max-w-xl text-white animate-fade-scripture">
        <p
          className="text-lg md:text-xl italic leading-relaxed"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          “{verse}”
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/80">{reference}</p>
      </div>
      <style jsx>{`
        .animate-fade-scripture {
          opacity: 0;
          animation: fadeIn 1.8s ease forwards;
          animation-delay: 2.4s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
