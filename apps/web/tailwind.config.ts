import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          yellow: "#FFD600",
          orange: "#FF6B00",
          red:    "#E8003D",
          purple: "#A855FF",
          blue:   "#4DA6FF",
        },
        // CSS-var-based semantic colors (resolves per theme)
        diiff: {
          bg:        "var(--color-bg-base)",
          surface:   "var(--color-bg-surface)",
          elevated:  "var(--color-bg-elevated)",
          border:    "var(--color-border-default)",
          glass:     "var(--color-glass-bg)",
          primary:   "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary:  "var(--color-text-tertiary)",
          disabled:  "var(--color-text-disabled)",
          success:   "var(--color-success)",
          warning:   "var(--color-warning)",
          error:     "var(--color-error)",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        body:    ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        mono:    ["var(--font-space-mono)", "Space Mono", "monospace"],
      },
      backgroundImage: {
        // Named gradients aligned to design spec
        "gradient-flame":  "linear-gradient(135deg, #FFD600 0%, #FF6B00 50%, #E8003D 100%)",
        "gradient-aurora": "linear-gradient(135deg, #7B2FFF 0%, #4040FF 50%, #0094FF 100%)",
        "gradient-dusk":   "linear-gradient(160deg, #2D0057 0%, #7B1230 50%, #FF4500 100%)",
        "gradient-prism":  "linear-gradient(135deg, #FF6B00, #FFD600, #00E5A0, #0094FF, #7B2FFF, #E8003D)",
        "gradient-ghost":  "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
        // Legacy aliases
        solar:  "linear-gradient(135deg, #FFD600 0%, #FF6B00 100%)",
        cosmic: "linear-gradient(135deg, #7B2FFF 0%, #0057FF 100%)",
        aurora: "linear-gradient(135deg, #FF3CAC 0%, #7B2FFF 50%, #0057FF 100%)",
        divine: "linear-gradient(135deg, #FFD600 0%, #FF3CAC 100%)",
        flame:  "linear-gradient(135deg, #FF1744 0%, #FF6B00 100%)",
      },
      borderRadius: {
        sm:   "8px",
        md:   "16px",
        lg:   "24px",
        xl:   "32px",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      backdropBlur: {
        xs: "2px",
        sm: "8px",
        md: "16px",
        lg: "32px",
        xl: "64px",
      },
      boxShadow: {
        "glow-yellow": "0 0 32px rgba(255,214,0,0.20), 0 0 64px rgba(255,107,0,0.12)",
        "glow-purple": "0 0 32px rgba(168,85,255,0.20), 0 0 64px rgba(120,40,255,0.10)",
        "glow-blue":   "0 0 32px rgba(77,166,255,0.15)",
        "glow-orange": "0 0 24px rgba(255,107,0,0.35)",
        "card":        "0 4px 16px rgba(0,0,0,0.50)",
        "card-lg":     "0 12px 40px rgba(0,0,0,0.60)",
      },
      animation: {
        "card-enter":     "card-enter 400ms cubic-bezier(0.22,1,0.36,1) both",
        "fade-up":        "fade-up 400ms cubic-bezier(0.22,1,0.36,1) both",
        "reaction-pop":   "reaction-pop 200ms cubic-bezier(0.32,0.72,0,1) both",
        "live-pulse":     "live-pulse 2s ease-in-out infinite",
        "prism-spin":     "prism-spin 4s linear infinite",
        // Legacy
        "fade-in":        "fadeIn 0.3s ease-in-out",
        "slide-up":       "slideUp 0.3s ease-out",
        "pulse-glow":     "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        "card-enter": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "reaction-pop": {
          "0%":   { transform: "scale(1)" },
          "40%":  { transform: "scale(1.35)" },
          "70%":  { transform: "scale(0.90)" },
          "100%": { transform: "scale(1)" },
        },
        "live-pulse": {
          "0%":   { boxShadow: "0 0 0 0 rgba(0,217,126,0.50)" },
          "70%":  { boxShadow: "0 0 0 8px rgba(0,217,126,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(0,217,126,0)" },
        },
        "prism-spin": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        // Legacy
        fadeIn:   { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:  { "0%": { transform: "translateY(12px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px 2px rgba(255,107,0,0.4)" },
          "50%":      { boxShadow: "0 0 20px 6px rgba(255,107,0,0.8)" },
        },
      },
      spacing: {
        "18": "72px",
        "22": "88px",
      },
    },
  },
  plugins: [],
};

export default config;
