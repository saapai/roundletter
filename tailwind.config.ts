import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4EFE6",
        ink: "#1C1A17",
        graphite: "#6B6560",
        moss: "#3F6B4A",
        rust: "#8B3A2E",
        parchment: "#EDE5D5",
      },
      fontFamily: {
        serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
        mono: ["ui-monospace", "Menlo", "Monaco", "Courier New", "monospace"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-body)", "ui-serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
