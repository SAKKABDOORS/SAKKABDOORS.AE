import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { ProductWithRelations } from "@/lib/types";
import ProductCard from "./ProductCard";
import Reveal from "./motion/Reveal";

// Shared by the full catalog (/products) and each dedicated category page
// (/products/[categorySlug]) so the grid/empty-state markup only lives once.
export default function ProductCatalogGrid({
  products,
  locale,
  dict,
  wholesale = false,
  onRequestQuote
}: {
  products: ProductWithRelations[];
  locale: Locale;
  dict: Dictionary;
  wholesale?: boolean;
  onRequestQuote?: (product: ProductWithRelations) => void;
}) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-ink-800/60">{dict.products.no_results}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p, i) => (
        <Reveal key={p.id} delay={Math.min((i % 6) * 0.06, 0.3)}>
          <ProductCard product={p} locale={locale} dict={dict} wholesale={wholesale} onRequestQuote={onRequestQuote} />
        </Reveal>
      ))}
    </div>
  );
}
