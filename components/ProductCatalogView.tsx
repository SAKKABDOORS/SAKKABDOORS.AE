"use client";

import { useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { ProductWithRelations } from "@/lib/types";
import ProductCatalogGrid from "./ProductCatalogGrid";
import OrderForm from "./OrderForm";

// Wraps ProductCatalogGrid with the retail/wholesale tab switch and the
// wholesale "request a quote" flow (click a product → OrderForm appears
// pre-filled, same reused-inquiry-pipeline pattern as CareersView's apply
// flow — no new backend, no published wholesale price, per the business
// decision that wholesale pricing is quoted per-order, not shown publicly).
export default function ProductCatalogView({
  products,
  locale,
  dict
}: {
  products: ProductWithRelations[];
  locale: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const wholesale = searchParams.get("mode") === "wholesale";
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function setMode(mode: "retail" | "wholesale") {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === "wholesale") {
      params.set("mode", "wholesale");
    } else {
      params.delete("mode");
    }
    setSelectedProduct(null);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleRequestQuote(product: ProductWithRelations) {
    setSelectedProduct(product);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const selectedName = selectedProduct ? (locale === "ar" ? selectedProduct.nameAr : selectedProduct.nameEn) : "";

  return (
    <div className="space-y-8">
      <div className="inline-flex rounded-full bg-sage-100 p-1">
        <button
          type="button"
          onClick={() => setMode("retail")}
          className={`rounded-full px-5 py-2 text-sm font-bold transition ${
            !wholesale ? "bg-brand-900 text-white" : "text-ink-800"
          }`}
        >
          {dict.products.mode_retail}
        </button>
        <button
          type="button"
          onClick={() => setMode("wholesale")}
          className={`rounded-full px-5 py-2 text-sm font-bold transition ${
            wholesale ? "bg-brand-900 text-white" : "text-ink-800"
          }`}
        >
          {dict.products.mode_wholesale}
        </button>
      </div>

      <ProductCatalogGrid
        products={products}
        locale={locale}
        dict={dict}
        wholesale={wholesale}
        onRequestQuote={handleRequestQuote}
      />

      {wholesale && selectedProduct && (
        <div ref={formRef} className="mx-auto max-w-xl scroll-mt-24">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-900">
              {dict.products.wholesale_quote_title}: {selectedName}
            </p>
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="text-sm font-medium text-ink-800/60 hover:text-ink-900"
            >
              {dict.products.wholesale_cancel}
            </button>
          </div>
          <OrderForm
            dict={dict}
            initialMessage={dict.products.wholesale_quote_message.replace("{product}", selectedName)}
            onSuccess={() => setSelectedProduct(null)}
          />
        </div>
      )}
    </div>
  );
}
