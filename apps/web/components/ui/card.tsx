import { cn } from "@/lib/utils/cn";

type GradientName = "solar" | "cosmic" | "aurora" | "divine" | "flame";

interface CardProps {
  children: React.ReactNode;
  gradient?: GradientName;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const gradientStyles: Record<GradientName, string> = {
  solar: "linear-gradient(135deg, #FFD600, #FF6B00)",
  cosmic: "linear-gradient(135deg, #7B2FFF, #0057FF)",
  aurora: "linear-gradient(135deg, #FF3CAC, #7B2FFF, #0057FF)",
  divine: "linear-gradient(135deg, #FFD600, #FF3CAC)",
  flame: "linear-gradient(135deg, #FF1744, #FF6B00)",
};

const paddingClasses = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  children,
  gradient,
  className,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={cn("rounded-3xl overflow-hidden", className)}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {gradient && (
        <div
          className="h-1 w-full"
          style={{ background: gradientStyles[gradient] }}
          aria-hidden="true"
        />
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
}
