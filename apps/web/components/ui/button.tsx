import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "text-black font-semibold hover:opacity-90 active:opacity-80",
  secondary:
    "text-white hover:bg-white/10 active:bg-white/5",
  destructive:
    "text-white font-semibold hover:opacity-90 active:opacity-80",
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: "linear-gradient(135deg, #FFD600, #FF6B00)" },
  secondary: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  destructive: { background: "#FF1744" },
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-5 py-2.5 text-base rounded-2xl",
  lg: "px-6 py-3.5 text-lg rounded-2xl",
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
        "inline-flex items-center justify-center gap-2 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
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
