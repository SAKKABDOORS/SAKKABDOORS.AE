import { Anton, Cairo, Inter } from "next/font/google";

// Body/UI text. Previously referenced by name only in globals.css with no
// actual @font-face behind them, so both silently fell back to system-ui —
// these next/font loaders self-host the real files and expose them as CSS
// variables globals.css now reads instead of hardcoded family names.
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap"
});

export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-arabic",
  display: "swap"
});

// Big-statement display font (hero title, section headings, CTA) — English
// only, since Anton has no Arabic glyphs. The Arabic equivalent reuses Cairo
// at its 900 (Black) weight instead of a second family — see .font-display
// in globals.css.
export const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-en",
  display: "swap"
});
