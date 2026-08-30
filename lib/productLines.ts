import type { Material } from "@/lib/types";

export const PRODUCT_LINES = [
  "ALUMINUM_SLIM_SYSTEM",
  "ALUMINUM_DOORS",
  "ALUMINUM_ECOBOND",
  "WPC_EXTERNAL",
  "WPC_CLOSETS"
] as const;

export type ProductLine = (typeof PRODUCT_LINES)[number];

export function isProductLine(value: string): value is ProductLine {
  return (PRODUCT_LINES as readonly string[]).includes(value);
}

export const PRODUCT_LINE_LABELS: Record<ProductLine, { ar: string; en: string }> = {
  ALUMINUM_SLIM_SYSTEM: { ar: "نظام سلم (Slim System)", en: "Slim System" },
  ALUMINUM_DOORS: { ar: "أبواب عادية", en: "Doors" },
  ALUMINUM_ECOBOND: { ar: "اليكوبوند", en: "Ecobond" },
  WPC_EXTERNAL: { ar: "خارجي", en: "External" },
  WPC_CLOSETS: { ar: "خزائن (كلوزيت)", en: "Closets" }
};

// Which lines apply to which material — Composite/Steel have none, so the
// line filter/field just doesn't render for them.
export const MATERIAL_PRODUCT_LINES: Partial<Record<Material, ProductLine[]>> = {
  ALUMINUM: ["ALUMINUM_SLIM_SYSTEM", "ALUMINUM_DOORS", "ALUMINUM_ECOBOND"],
  WPC: ["WPC_EXTERNAL", "WPC_CLOSETS"]
};
