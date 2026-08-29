import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { firstProductImageUrl, type ProductWithRelations } from "@/lib/types";
import { productPath } from "@/lib/materialPaths";
import AddToCartButton from "./cart/AddToCartButton";

export default function ProductCard({
  product,
  locale,
  dict,
  wholesale = false,
  onRequestQuote
}: {
  product: ProductWithRelations;
  locale: Locale;
  dict: Dictionary;
  // Wholesale mode swaps the retail price/cart affordance for a "request a
  // quote" flow — no wholesale price is ever shown publicly (per the
  // business decision: pricing is negotiated per-order, not published).
  wholesale?: boolean;
  onRequestQuote?: (product: ProductWithRelations) => void;
}) {
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const categoryName = locale === "ar" ? product.category.nameAr : product.category.nameEn;
  const image = firstProductImageUrl(product.images) ?? "/images/placeholder-door.svg";

  return (
    <div className="card-interactive group flex flex-col overflow-hidden">
      <Link href={`/${locale}${productPath(product.material, product.slug)}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-100">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          {product.featured && (
            <span className="absolute top-3 start-3 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
              {locale === "ar" ? "مميز" : "Featured"}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-brand-500">
            {categoryName}
          </span>
          <h3 className="font-semibold text-ink-900">{name}</h3>
          <div className="mt-auto flex items-center justify-between pt-3">
            <span className="text-sm font-semibold text-brand-700">{dict.products.ask_price}</span>
            <span
              className={`text-xs font-medium ${
                product.inStock ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {product.inStock ? dict.products.in_stock : dict.products.out_of_stock}
            </span>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        {wholesale ? (
          <button
            type="button"
            onClick={() => onRequestQuote?.(product)}
            className="btn-secondary w-full py-2 text-sm"
          >
            {dict.products.request_quote}
          </button>
        ) : (
          <AddToCartButton
            product={{ id: product.id, slug: product.slug, name, image, price: product.price, currency: product.currency }}
            label={dict.product.add_to_cart}
            addedLabel={dict.product.added_to_cart}
            className="btn-secondary w-full py-2 text-sm"
          />
        )}
      </div>
    </div>
  );
}
