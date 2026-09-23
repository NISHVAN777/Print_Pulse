import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * PrintPulse palette, taken from the pitch deck:
 * deep navy, mid blue, and a violet accent on a lot of white space.
 * Tokens point at CSS variables so dark mode can retune them.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          navy: "var(--brand-navy)",
          blue: "var(--brand-blue)",
          bright: "var(--brand-bright)",
          violet: "var(--brand-violet)",
          ink: "var(--brand-ink)",
        },
        sentiment: {
          positive: "var(--positive)",
          neutral: "var(--neutral-print)",
          negative: "var(--negative)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11, 17, 32, 0.04), 0 12px 32px -20px rgba(11, 17, 32, 0.18)",
        lift: "0 24px 60px -28px rgba(11, 17, 32, 0.35)",
        glow: "0 0 0 1px rgba(124, 58, 237, 0.18), 0 18px 50px -24px rgba(30, 58, 138, 0.45)",
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(109, 74, 255, 0.45)" },
          "50%": { boxShadow: "0 0 0 8px rgba(109, 74, 255, 0)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2.2s ease-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
