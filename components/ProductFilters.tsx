"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Category } from "@/lib/types";

const MATERIALS = ["WPC", "UPVC", "ALUMINUM", "STEEL"] as const;

export default function ProductFilters({
  categories,
  locale,
  dict,
  lockedCategory
}: {
  categories: Category[];
  locale: Locale;
  dict: Dictionary;
  // Set on a dedicated category page (/products/[categorySlug]) — the
  // category is already fixed by the URL itself, so the dropdown that would
  // otherwise let a visitor navigate away via a `?category=` query param is
  // hidden instead of shown-but-conflicting.
  lockedCategory?: Category;
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
