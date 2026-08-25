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
