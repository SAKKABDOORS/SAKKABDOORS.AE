import path from "path";
import { Font } from "@react-pdf/renderer";

let registered = false;

// Amiri (OFL, google/fonts) is a traditional Naskh Arabic typeface with
// proper static Regular/Bold weights — @react-pdf/renderer needs a real
// embedded TTF to shape/join Arabic letterforms correctly; verified with a
// render spike before building the catalog document around it.
export function registerCatalogFonts() {
  if (registered) return;
  const dir = path.join(process.cwd(), "public", "fonts");
  Font.register({
    family: "Amiri",
    fonts: [
      { src: path.join(dir, "Amiri-Regular.ttf"), fontWeight: "normal" },
      { src: path.join(dir, "Amiri-Bold.ttf"), fontWeight: "bold" }
    ]
  });
  registered = true;
}

// Amiri's shaping (via @react-pdf/fontkit) mis-positions the "يخ" letter
// pair — every glyph after it collapses onto the same spot instead of
// advancing (reproduced in isolation, independent of weight/layout/width,
// so it's a font/shaping bug, not a layout bug). Breaks the connecting
// stroke with a zero-width joiner, which sidesteps the bad glyph pair while
// keeping the letters visually joined. Must be applied to every piece of
// Arabic text rendered through this font (static labels and DB content
// alike — e.g. "التاريخ" and the client's own terms text both contain it).
export function fixArabicShaping(text: string): string {
  return text.replace(/يخ/g, "ي‍خ");
}
