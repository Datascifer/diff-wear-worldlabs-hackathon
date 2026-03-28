import { cn } from "@/lib/utils/cn";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

function DiiffLogo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-label="Diiff"
      role="img"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD600" />
          <stop offset="100%" stopColor="#FF6B00" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="13" fill="url(#logo-grad)" />
      <text
        x="14"
        y="19"
        textAnchor="middle"
        fontSize="13"
        fill="#0a0012"
        fontWeight="bold"
      >
        D
      </text>
    </svg>
  );
}

export function Header({ title, subtitle, className }: HeaderProps) {
  return (
    <header className={cn("px-4 pt-6 pb-2 flex items-center gap-3", className)}>
      <DiiffLogo />
      {(title ?? subtitle) && (
        <div>
          {title && (
            <h1
              className="text-white font-bold text-xl leading-tight"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-white/50 text-xs">{subtitle}</p>
          )}
        </div>
      )}
    </header>
  );
}
