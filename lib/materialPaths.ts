import type { Material } from "@/lib/types";

// Each door material gets its own top-level section (like /realestate)
// instead of living under /products?material=... — this is the single
// source of truth for that mapping, used by the new /wpc, /aluminum,
// /composite routes, internal links (ProductCard, CategorySpotlight, cart,
// sitemap), and the legacy /products/[slug] redirector.
export const MATERIAL_PATHS: Record<Material, string> = {
  WPC: "wpc",
  UPVC: "composite",
  ALUMINUM: "aluminum",
  STEEL: "products" // no dedicated section (not offered as a catalog line today) — falls back to the generic catalog
};

export const MATERIAL_CATEGORY_SLUGS: Record<Material, string> = {
  WPC: "wpc-doors",
  UPVC: "upvc-doors",
  ALUMINUM: "aluminum-doors",
  STEEL: "aluminum-doors"
};

export function productPath(material: Material, slug: string) {
  return `/${MATERIAL_PATHS[material]}/${slug}`;
}

const CATEGORY_SLUG_TO_SECTION_PATH: Record<string, string> = {
  "wpc-doors": MATERIAL_PATHS.WPC,
  "upvc-doors": MATERIAL_PATHS.UPVC,
  "aluminum-doors": MATERIAL_PATHS.ALUMINUM
};

// Homepage spotlight buttons link to a Category (not a Material directly)
// — same mapping, keyed by category slug instead.
export function categoryPath(categorySlug: string) {
  return `/${CATEGORY_SLUG_TO_SECTION_PATH[categorySlug] ?? "catalog"}`;
}
