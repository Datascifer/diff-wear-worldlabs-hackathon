import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--gradient-flame)",
    color: "#ffffff",
  },
  secondary: {
    background: "var(--color-glass-bg)",
    border: "1px solid var(--color-border-strong)",
    color: "var(--color-text-primary)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-secondary)",
  },
  destructive: {
    background: "rgba(232,0,61,0.12)",
    border: "1px solid rgba(232,0,61,0.25)",
    color: "var(--color-error)",
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9  px-4 text-sm  rounded-md",
  md: "h-12 px-6 text-base rounded-md",
  lg: "h-14 px-8 text-lg  rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  style,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold",
        "transition-all duration-150 active:scale-[0.97]",
        "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        sizeClasses[size],
        className
      )}
      style={{ ...variantStyles[variant], ...style }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
