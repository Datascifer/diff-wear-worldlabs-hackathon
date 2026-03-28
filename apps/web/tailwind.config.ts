import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFD600",
          orange: "#FF6B00",
          red: "#FF1744",
          purple: "#7B2FFF",
          blue: "#0057FF",
          pink: "#FF3CAC",
        },
        surface: {
          base: "#0a0012",
          elevated: "rgba(255,255,255,0.04)",
          border: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      backgroundImage: {
        solar: "linear-gradient(135deg, #FFD600 0%, #FF6B00 100%)",
        cosmic: "linear-gradient(135deg, #7B2FFF 0%, #0057FF 100%)",
        aurora: "linear-gradient(135deg, #FF3CAC 0%, #7B2FFF 50%, #0057FF 100%)",
        divine: "linear-gradient(135deg, #FFD600 0%, #FF3CAC 100%)",
        flame: "linear-gradient(135deg, #FF1744 0%, #FF6B00 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px 2px rgba(255, 107, 0, 0.4)" },
          "50%": { boxShadow: "0 0 20px 6px rgba(255, 107, 0, 0.8)" },
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
