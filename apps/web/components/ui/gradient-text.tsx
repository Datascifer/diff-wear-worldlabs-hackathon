import { cn } from "@/lib/utils/cn";

type GradientName = "solar" | "cosmic" | "aurora" | "divine" | "flame";

const gradients: Record<GradientName, string> = {
  solar: "linear-gradient(135deg, #FFD600, #FF6B00)",
  cosmic: "linear-gradient(135deg, #7B2FFF, #0057FF)",
  aurora: "linear-gradient(135deg, #FF3CAC, #7B2FFF, #0057FF)",
  divine: "linear-gradient(135deg, #FFD600, #FF3CAC)",
  flame: "linear-gradient(135deg, #FF1744, #FF6B00)",
};

interface GradientTextProps {
  gradient: GradientName;
  children: React.ReactNode;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

export function GradientText({
  gradient,
  children,
  className,
  as: Tag = "span",
}: GradientTextProps) {
  return (
    <Tag
      className={cn(className)}
      style={{
        background: gradients[gradient],
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </Tag>
  );
}
