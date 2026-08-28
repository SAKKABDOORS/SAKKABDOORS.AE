"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Category, Material } from "@/lib/types";
import { PRODUCT_LINE_LABELS, type ProductLine } from "@/lib/productLines";

const MATERIALS = ["WPC", "UPVC", "ALUMINUM", "STEEL"] as const;

export default function ProductFilters({
  categories,
  locale,
  dict,
  lockedCategory,
  lockedMaterial,
  productLines
}: {
  categories: Category[];
  locale: Locale;
  dict: Dictionary;
  // Set on a dedicated category page (/products/[categorySlug]) — the
  // category is already fixed by the URL itself, so the dropdown that would
  // otherwise let a visitor navigate away via a `?category=` query param is
  // hidden instead of shown-but-conflicting.
  lockedCategory?: Category;
  // Same idea, for the dedicated material sections (/wpc, /aluminum,
  // /composite) — the material is fixed by which section you're on.
  lockedMaterial?: Material;
  // Only Aluminum/WPC have sub-lines (Slim System/Doors, External/Closets)
  // — omitted (or empty) elsewhere, so no extra dropdown renders.
  productLines?: ProductLine[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6">
      {!lockedCategory && (
        <div className="flex-1">
          <label className="label">{dict.products.filter_category}</label>
          <select
            className="input"
            defaultValue={searchParams.get("category") ?? ""}
            onChange={(e) => updateParam("category", e.target.value)}
          >
            <option value="">{dict.products.all_categories}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {locale === "ar" ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>
        </div>
      )}

      {!lockedMaterial && (
        <div className="flex-1">
          <label className="label">{dict.products.filter_material}</label>
          <select
            className="input"
            defaultValue={searchParams.get("material") ?? ""}
            onChange={(e) => updateParam("material", e.target.value)}
          >
            <option value="">{dict.products.all_materials}</option>
            {MATERIALS.map((m) => (
              <option key={m} value={m}>
                {dict.products.material[m]}
              </option>
            ))}
          </select>
        </div>
      )}

      {productLines && productLines.length > 0 && (
        <div className="flex-1">
          <label className="label">{dict.products.filter_line}</label>
          <select
            className="input"
            defaultValue={searchParams.get("line") ?? ""}
            onChange={(e) => updateParam("line", e.target.value)}
          >
            <option value="">{dict.products.all_lines}</option>
            {productLines.map((line) => (
              <option key={line} value={line}>
                {PRODUCT_LINE_LABELS[line][locale]}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex-1">
        <label className="label">{dict.products.sort}</label>
        <select
          className="input"
          defaultValue={searchParams.get("sort") ?? "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          <option value="newest">{dict.products.sort_newest}</option>
          <option value="price_asc">{dict.products.sort_price_asc}</option>
          <option value="price_desc">{dict.products.sort_price_desc}</option>
        </select>
      </div>
    </div>
  );
}
