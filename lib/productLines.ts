import type { Material } from "@/lib/types";

export const PRODUCT_LINES = [
  "ALUMINUM_SLIM_SYSTEM",
  "ALUMINUM_DOORS",
  "ALUMINUM_ALUCOBOND",
  "WPC_EXTERNAL",
  "WPC_CLOSETS",
  "WPC_DOORS",
  "WPC_INTERIOR_DECOR",
  "COMPOSITE_DOORS",
  "COMPOSITE_EXTERIOR_DECOR"
] as const;

export type ProductLine = (typeof PRODUCT_LINES)[number];

export function isProductLine(value: string): value is ProductLine {
  return (PRODUCT_LINES as readonly string[]).includes(value);
}

export const PRODUCT_LINE_LABELS: Record<ProductLine, { ar: string; en: string }> = {
  ALUMINUM_SLIM_SYSTEM: { ar: "نظام سلم (Slim System)", en: "Slim System" },
  ALUMINUM_DOORS: { ar: "أبواب", en: "Doors" },
  ALUMINUM_ALUCOBOND: { ar: "ألوكوبوند", en: "Alucobond" },
  WPC_EXTERNAL: { ar: "خارجي", en: "External" },
  WPC_CLOSETS: { ar: "خزائن (كلوزيت)", en: "Closets" },
  WPC_DOORS: { ar: "أبواب", en: "Doors" },
  WPC_INTERIOR_DECOR: { ar: "ديكور داخلي", en: "Interior Decor" },
  COMPOSITE_DOORS: { ar: "أبواب", en: "Doors" },
  COMPOSITE_EXTERIOR_DECOR: { ar: "ديكور خارجي", en: "Exterior Decor" }
};

// Which lines apply to which material — Steel has none, so the line
// filter/field just doesn't render for it.
export const MATERIAL_PRODUCT_LINES: Partial<Record<Material, ProductLine[]>> = {
  ALUMINUM: ["ALUMINUM_DOORS", "ALUMINUM_SLIM_SYSTEM", "ALUMINUM_ALUCOBOND"],
  WPC: ["WPC_DOORS", "WPC_CLOSETS", "WPC_INTERIOR_DECOR", "WPC_EXTERNAL"],
  UPVC: ["COMPOSITE_DOORS", "COMPOSITE_EXTERIOR_DECOR"]
};

// URL segment for each line under its material's /catalog/[material]/...
// route (e.g. /catalog/wpc/doors) — same slug ("doors") reused across
// materials on purpose, since the material prefix already disambiguates.
export const PRODUCT_LINE_SLUGS: Record<ProductLine, string> = {
  ALUMINUM_SLIM_SYSTEM: "slim-system",
  ALUMINUM_DOORS: "doors",
  ALUMINUM_ALUCOBOND: "alucobond",
  WPC_EXTERNAL: "external",
  WPC_CLOSETS: "closets",
  WPC_DOORS: "doors",
  WPC_INTERIOR_DECOR: "interior-decor",
  COMPOSITE_DOORS: "doors",
  COMPOSITE_EXTERIOR_DECOR: "exterior-decor"
};

// Reverse lookup used by /catalog/[material]/[slug] to tell a sub-line
// listing (e.g. "doors") apart from an actual product slug — only the
// lines that apply to that material are considered, so "doors" resolves to
// WPC_DOORS under /catalog/wpc but ALUMINUM_DOORS under /catalog/aluminum.
export function productLineForSlug(material: Material, slug: string): ProductLine | undefined {
  return (MATERIAL_PRODUCT_LINES[material] ?? []).find((line) => PRODUCT_LINE_SLUGS[line] === slug);
}
