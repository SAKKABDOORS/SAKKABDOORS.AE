import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Category, Material } from "@/lib/types";
import { isProductLine, type ProductLine } from "@/lib/productLines";
import ProductFilters from "@/components/ProductFilters";
import ProductCatalogView from "@/components/ProductCatalogView";
import Reveal from "@/components/motion/Reveal";
import { Download } from "lucide-react";

// Shared by /catalog/[material] and /catalog/[material]/[slug]'s sub-line
// branch — one material's catalog, optionally with a sub-line filter
// (Doors, Slim System, Alucobond, Closets, Interior/Exterior Decor...).
export default async function MaterialCatalogView({
  category,
  material,
  locale,
  dict,
  searchParams,
  productLines,
  catalogPdfUrl,
  lineBasePath
}: {
  category: Category;
  material: Material;
  locale: Locale;
  dict: Dictionary;
  searchParams: { sort?: string; line?: string };
  productLines?: ProductLine[];
  // Admin-uploaded PDF for this section (not the auto-generated one) —
  // hidden until one's uploaded from /admin/content -> "كتالوجات PDF".
  catalogPdfUrl?: string;
  // /catalog/[material] — when set, the sub-line filter navigates to a real
  // clean URL (e.g. /catalog/wpc/doors) instead of a ?line= query param.
  lineBasePath?: string;
}) {
  const categories = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });

  const currentLine = searchParams.line && isProductLine(searchParams.line) ? searchParams.line : undefined;
  const where: Record<string, unknown> = { categoryId: category.id };
  if (currentLine) {
    where.productLine = currentLine;
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
          <ProductFilters
            categories={categories}
            locale={locale}
            dict={dict}
            lockedCategory={category}
            lockedMaterial={material}
            productLines={productLines}
            lineBasePath={lineBasePath}
            currentLine={currentLine}
          />
          {catalogPdfUrl && (
            <a
              href={catalogPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-4 inline-flex"
            >
              <Download className="h-4 w-4" />
              {dict.products.download_catalog}
            </a>
          )}
        </div>

        <div className={category.heroImage ? "mt-8" : undefined}>
          <ProductCatalogView products={products} locale={locale} dict={dict} />
        </div>
      </div>
    </div>
  );
}
