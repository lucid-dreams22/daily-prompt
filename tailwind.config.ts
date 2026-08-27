import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBF3E7",
        "paper-dim": "#F3E4CE",
        ink: "#4A3628",
        "ink-soft": "#8A7160",
        gold: "#E2963B",
        rust: "#C1502E",
        teal: "#6B7A52",
        indigo: "#6B3F55",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-plex)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(31,53,41,0.08), 0 8px 20px -12px rgba(31,53,41,0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
