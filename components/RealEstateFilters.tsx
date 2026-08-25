"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

export default function RealEstateFilters({
  regions,
  locale,
  dict
}: {
  regions: { ar: string; en: string }[];
  locale: Locale;
  dict: Dictionary;
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
      <div className="flex-1">
        <label className="label">{dict.realestate.filter_region}</label>
        <select
          className="input"
          defaultValue={searchParams.get("region") ?? ""}
          onChange={(e) => updateParam("region", e.target.value)}
        >
          <option value="">{dict.realestate.all_regions}</option>
          {regions.map((r) => (
            <option key={r.ar} value={r.ar}>
              {locale === "ar" ? r.ar : r.en}
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
