import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEF0E6",
        "paper-dim": "#E3E6D8",
        ink: "#1F3529",
        "ink-soft": "#3C5245",
        gold: "#E0A233",
        rust: "#BE5233",
        teal: "#276B6B",
        indigo: "#3E4A8C",
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
