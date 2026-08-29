import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { firstProductImageUrl, type ProductWithRelations } from "@/lib/types";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import OrderForm from "@/components/OrderForm";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";

// Shared by /wpc/[slug], /aluminum/[slug], /composite/[slug] (and the
// legacy /products/[slug] product branch, kept only as a redirector).
export default function ProductDetailView({
  product,
  locale,
  dict
}: {
  product: ProductWithRelations;
  locale: Locale;
  dict: Dictionary;
}) {
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? product.descriptionAr : product.descriptionEn;
  const categoryName = locale === "ar" ? product.category.nameAr : product.category.nameEn;
  const image = firstProductImageUrl(product.images) ?? "/images/placeholder-door.svg";
  const whatsappHref = buildWhatsAppLink(
    locale === "ar"
      ? `مرحباً، أرغب بالاستفسار عن: ${name}`
      : `Hello, I'd like to ask about: ${name}`
  );

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images.map((img) => ({
            url: img.url,
            alt: img.alt || name,
            type: img.type === "VIDEO" ? "video" : "image"
          }))}
          fallbackAlt={name}
        />

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {categoryName}
          </span>
          <h1 className="mt-1 text-3xl font-bold text-ink-900">{name}</h1>

          <div className="mt-4 flex items-center gap-4">
            <span className="text-2xl font-extrabold text-brand-700">{dict.products.ask_price}</span>
            <span
              className={`text-sm font-medium ${
                product.inStock ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {product.inStock ? dict.products.in_stock : dict.products.out_of_stock}
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-ink-800/60">{dict.product.material}</dt>
              <dd className="font-medium text-ink-900">{dict.products.material[product.material]}</dd>
            </div>
            <div>
              <dt className="text-ink-800/60">{dict.product.category}</dt>
              <dd className="font-medium text-ink-900">{categoryName}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-ink-900">{dict.product.description}</h2>
            <p className="text-sm leading-relaxed text-ink-800/80">{description}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton
              product={{ id: product.id, slug: product.slug, name, image, price: product.price, currency: product.currency }}
              label={dict.product.add_to_cart}
              addedLabel={dict.product.added_to_cart}
              className="btn-primary"
            />
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              {dict.product.ask_whatsapp}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-xl">
        <OrderForm dict={dict} productId={product.id} productName={name} />
      </div>
    </div>
  );
}
