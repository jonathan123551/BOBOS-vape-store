import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#7c3aed",
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        neon: {
          purple: "#a855f7",
          blue: "#3b82f6",
          cyan: "#22d3ee",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        arabic: ["Tajawal", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neon-purple":
          "0 0 18px rgba(168,85,247,.55), 0 0 36px rgba(168,85,247,.25)",
        "neon-cyan":
          "0 0 18px rgba(34,211,238,.55), 0 0 36px rgba(34,211,238,.25)",
      },
      backgroundImage: {
        "smoke-radial":
          "radial-gradient(1200px 500px at 50% -100px, rgba(124,58,237,.25), transparent 60%), radial-gradient(800px 400px at 80% 10%, rgba(34,211,238,.18), transparent 60%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        glow: "glow 3s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 14px rgba(168,85,247,.45)" },
          "50%": { boxShadow: "0 0 28px rgba(168,85,247,.85)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
