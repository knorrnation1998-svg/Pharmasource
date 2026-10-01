import type { Config } from "tailwindcss";

/**
 * Design tokens derive from the brand motif: a customs manifest for
 * amber-glass pharmaceuticals. Navy = documentation, amber = the vial itself,
 * clearance green = a cleared customs status, alert = a temperature excursion.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        manifest: {
          50: "#F2F5F7",
          100: "#DDE5EA",
          200: "#B6C6D1",
          400: "#4A6A82",
          600: "#22455E",
          800: "#13293D", // primary ink
          900: "#0B1B28",
        },
        sterile: "#F7F9FA",
        phial: {
          50: "#FBF4E8",
          200: "#EBD3A6",
          500: "#B26A00", // accent — amber pharmaceutical glass
          700: "#7E4A00",
        },
        clearance: { 100: "#DDEDE7", 500: "#1F6F5C", 700: "#14493D" },
        excursion: { 100: "#F6DEDE", 500: "#9B2C2C" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        code: ["var(--font-code)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Modular scale, 1.25 ratio, anchored at 16px body.
        "display-lg": ["clamp(2.75rem, 6vw, 4.5rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        "heading": ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      maxWidth: { prose: "68ch" },
      borderRadius: { sheet: "2px", card: "6px" },
      boxShadow: {
        sheet: "0 1px 0 0 rgba(19,41,61,0.08), 0 1px 3px -1px rgba(19,41,61,0.10)",
        lifted: "0 12px 32px -12px rgba(19,41,61,0.28)",
      },
      gridTemplateColumns: {
        manifest: "minmax(0,3fr) minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) auto",
      },
    },
  },
  plugins: [],
};

export default config;
