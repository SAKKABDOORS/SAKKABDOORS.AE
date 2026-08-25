import type { Config } from "tailwindcss";

// Brand palette sampled DIRECTLY off pixels of SAKKAB's own Canva reference
// (wpc_doors_reference.pdf / doors catalog cover) — not eyeballed:
//   header/nav bar   -> #193123  (brand-900)
//   buttons/CTA/footer -> #2b503a  (brand-700)
//   page background (stats/services/spotlight/quality sections) -> #cbc7b7 (sage-300)
//   elevated card tone (stat cards, service pills) -> #d7d3c7 (sage-200)
//   quality-feature card + CTA banner tan -> #c9bca7 (sand-300)
// Every other step in each scale is interpolated from those anchors.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary — deep forest green (buttons, links, footer, header bar)
        brand: {
          50: "#eef2ee",
          100: "#d6e0d5",
          200: "#b3c4b0",
          300: "#8aa485",
          400: "#5f7d5b",
          500: "#3f6248",
          600: "#345a3f",
          700: "#2b503a",
          800: "#22402e",
          900: "#193123"
        },
        // Sage — warm neutral greige used as the main page surface behind
        // the stats/services/category-spotlight/quality/group-brand sections
        sage: {
          50: "#f5f3ee",
          100: "#e9e5d9",
          200: "#d7d3c7",
          300: "#cbc7b7",
          400: "#b3ac97",
          500: "#96907a"
        },
        // Sand — deeper warm tan for the quality-feature cards + CTA banner
        sand: {
          50: "#faf7f0",
          100: "#efe6d5",
          200: "#ded2ba",
          300: "#c9bca7",
          400: "#b5a488",
          500: "#9c8a6c"
        },
        ink: {
          900: "#1b1b18",
          800: "#2b2a24"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "Tahoma", "sans-serif"]
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
