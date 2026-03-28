import { cn } from "@/lib/utils/cn";

// Gradient accent line at top — legacy prop kept for backward compat.
// New code should use glass-card styles directly.
type GradientName = "solar" | "cosmic" | "aurora" | "divine" | "flame";

const gradientStyles: Record<GradientName, string> = {
  solar:  "linear-gradient(135deg, #FFD600, #FF6B00)",
  cosmic: "linear-gradient(135deg, #7B2FFF, #4040FF)",
  aurora: "linear-gradient(135deg, #7B2FFF, #4040FF, #0094FF)",
  divine: "linear-gradient(135deg, #FFD600, #FF6B00, #E8003D)",
  flame:  "linear-gradient(135deg, #FFD600, #FF6B00, #E8003D)",
};

interface CardProps {
  children: React.ReactNode;
  gradient?: GradientName;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingClasses = { sm: "p-4", md: "p-5", lg: "p-6" };

export function Card({ children, gradient, className, padding = "md" }: CardProps) {
  return (
    <div
      className={cn("rounded-lg overflow-hidden", className)}
      style={{
        background: "var(--color-glass-bg)",
        border: "1px solid var(--color-glass-border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {gradient && (
        <div
          className="h-px w-full"
          style={{ background: gradientStyles[gradient] }}
          aria-hidden="true"
        />
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
}
