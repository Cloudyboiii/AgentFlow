import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        serif: ['"Tiempos Headline"', 'Georgia', 'serif'],
      },
      colors: {
        space: {
          900: "#090E17",
          800: "#101623",
          700: "#1A2333",
        },
        accent: {
          cyan: "#00f0ff",
          cyanHover: "#33f3ff",
          violet: "#b026ff",
        },
        glass: {
          light: "rgba(255, 255, 255, 0.05)",
          hover: "rgba(255, 255, 255, 0.08)",
          cyan: "rgba(0, 240, 255, 0.1)",
        },
        text: {
          primary: "#f8f9fa",
          secondary: "#94a3b8",
          muted: "#64748b",
        }
      },
      animation: {
        "aurora-shift": "aurora-shift 15s ease infinite",
        "pulse-fast": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        "aurora-shift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.4" },
          "33%": { transform: "translate(5%, 5%) scale(1.1)", opacity: "0.6" },
          "66%": { transform: "translate(-5%, -5%) scale(0.9)", opacity: "0.5" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        }
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#f8f9fa',
            a: {
              color: '#00f0ff',
              '&:hover': {
                color: '#33f3ff',
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
