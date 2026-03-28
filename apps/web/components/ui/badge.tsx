import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  earned: boolean;
  icon: string;
  label: string;
  className?: string;
}

export function Badge({ earned, icon, label, className }: BadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 p-2 rounded-2xl transition-opacity",
        earned ? "opacity-100" : "opacity-30 grayscale",
        className
      )}
      title={label}
      aria-label={`${label}${earned ? " (earned)" : " (not yet earned)"}`}
    >
      <span className="text-2xl" role="img" aria-hidden="true">
        {icon}
      </span>
      <span className="text-white/60 text-xs text-center leading-tight max-w-[60px]">
        {label}
      </span>
    </div>
  );
}
