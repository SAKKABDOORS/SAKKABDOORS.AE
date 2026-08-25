import { prisma } from "@/lib/prisma";
import { getDictionary, type Dictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import type { Category, Material } from "@/lib/types";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import OrderForm from "@/components/OrderForm";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import ProductFilters from "@/components/ProductFilters";
import ProductCatalogView from "@/components/ProductCatalogView";
import Reveal from "@/components/motion/Reveal";

// This single [slug] segment serves two purposes so /products/wpc-doors (a
// category) and /products/wpc-classic-entry-door (a product) can both live
// under the clean /products/* namespace — Next.js doesn't allow two
// different dynamic segment names ([slug] and [categorySlug]) as siblings
// at the same route level, so the category is tried first here instead of
// being a separate route.
export default async function ProductOrCategoryPage({
  params,
  searchParams
}: {
  params: { locale: string; slug: string };
  searchParams: { material?: string; sort?: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (category) {
    return (
      <CategoryCatalogPage
        category={category}
        locale={locale}
        dict={dict}
        searchParams={searchParams}
      />
    );
  }

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: true, category: true }
  });

  if (!product) notFound();

  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? product.descriptionAr : product.descriptionEn;
  const categoryName = locale === "ar" ? product.category.nameAr : product.category.nameEn;
  const image = product.images[0]?.url ?? "/images/placeholder-door.svg";
  const whatsappHref = buildWhatsAppLink(
    locale === "ar"
      ? `مرحباً، أرغب بالاستفسار عن: ${name}`
      : `Hello, I'd like to ask about: ${name}`
  );

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images.map((img) => ({ url: img.url, alt: img.alt || name }))}
          fallbackAlt={name}
        />

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {categoryName}
          </span>
          <h1 className="mt-1 text-3xl font-bold text-ink-900">{name}</h1>

          <div className="mt-4 flex items-center gap-4">
            <span className="text-2xl font-extrabold text-brand-700">
              {product.price.toLocaleString(locale === "ar" ? "ar-AE" : "en-AE")} {product.currency}
            </span>
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

async function CategoryCatalogPage({
  category,
  locale,
  dict,
  searchParams
}: {
  category: Category;
  locale: Locale;
  dict: Dictionary;
  searchParams: { material?: string; sort?: string };
}) {
  const categories = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });

  const where: Record<string, unknown> = { categoryId: category.id };
  if (searchParams.material) {
    where.material = searchParams.material as Material;
  }

  const orderBy =
    searchParams.sort === "price_asc"
      ? { price: "asc" as const }
      : searchParams.sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const products = await prisma.product.findMany({
    where,
    include: { images: true, category: true },
    orderBy
  });

  const name = locale === "ar" ? category.nameAr : category.nameEn;
  const tagline = locale === "ar" ? category.taglineAr : category.taglineEn;
  const description = locale === "ar" ? category.descriptionAr : category.descriptionEn;

  return (
    <div>
      {category.heroImage ? (
        <div className="relative h-64 w-full overflow-hidden sm:h-80">
          <img src={category.heroImage} alt={name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/30 to-transparent" />
          <div className="container-page absolute inset-0 flex flex-col justify-end pb-14">
            <Reveal>
              <h1 className="font-display text-3xl text-white sm:text-5xl">{name}</h1>
              {tagline && <p className="mt-1 text-sm font-semibold text-white/85">{tagline}</p>}
            </Reveal>
          </div>
        </div>
      ) : (
        <div className="bg-sage-300 py-10">
          <div className="container-page">
            <Reveal>
              <h1 className="font-display mb-2 text-2xl text-ink-900 sm:text-4xl">{name}</h1>
              {description && <p className="max-w-2xl text-ink-800/80">{description}</p>}
            </Reveal>
          </div>
        </div>
      )}

      <div className="container-page py-10">
        {/* Negative top margin floats the filter panel over the hero photo's
            bottom edge instead of sitting flush below it — only meaningful
            when there's a hero image; harmless (no visible gap change) when
            there isn't, since there's no dark band above to float over. */}
        <div className={category.heroImage ? "relative z-10 -mt-16" : "mb-8"}>
          {category.heroImage && description && (
            <p className="mb-4 max-w-2xl text-ink-800/80">{description}</p>
          )}
          <ProductFilters categories={categories} locale={locale} dict={dict} lockedCategory={category} />
        </div>

        <div className={category.heroImage ? "mt-8" : undefined}>
          <ProductCatalogView products={products} locale={locale} dict={dict} />
        </div>
      </div>
    </div>
  );
}
