import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { firstProductImageUrl } from "@/lib/types";
import ProductDetailView from "@/components/catalog/ProductDetailView";
import MaterialCatalogView from "@/components/catalog/MaterialCatalogView";
import { MATERIAL_PRODUCT_LINES, PRODUCT_LINE_LABELS, productLineForSlug } from "@/lib/productLines";
import { getSiteSetting } from "@/lib/siteContent";
import { resolveCatalogMaterial, MATERIAL_CATEGORY_SLUGS, CATALOG_PDF_KEY } from "@/lib/materialPaths";

// This one segment does double duty: a known sub-line slug ("doors",
// "closets", "slim-system"...) renders a filtered listing, anything else is
// looked up as an actual product slug — same disambiguation the old
// /products/[slug] legacy redirector used for category-vs-product.
export async function generateMetadata({
  params
}: {
  params: { locale: string; material: string; slug: string };
}): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const material = resolveCatalogMaterial(params.material);
  if (!material) return {};

  const line = productLineForSlug(material, params.slug);
  const path = `/catalog/${params.material}/${params.slug}`;
  const alternates = { languages: { ar: `/ar${path}`, en: `/en${path}` } };

  if (line) {
    const category = await prisma.category.findUnique({ where: { slug: MATERIAL_CATEGORY_SLUGS[material] } });
    if (!category) return {};
    const materialName = locale === "ar" ? category.nameAr : category.nameEn;
    const lineName = PRODUCT_LINE_LABELS[line][locale];
    const name = `${lineName} — ${materialName}`;
    return { title: name, alternates, openGraph: { title: name } };
  }

  const product = await prisma.product.findUnique({ where: { slug: params.slug }, include: { images: true } });
  if (!product || product.material !== material) return {};

  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? product.descriptionAr : product.descriptionEn;
  const image = firstProductImageUrl(product.images);
  return { title: name, description, alternates, openGraph: { title: name, description, images: image ? [image] : undefined } };
}

export default async function MaterialSlugPage({
  params,
  searchParams
}: {
  params: { locale: string; material: string; slug: string };
  searchParams: { sort?: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const material = resolveCatalogMaterial(params.material);
  if (!material) notFound();
  const dict = await getDictionary(locale);

  const line = productLineForSlug(material, params.slug);
  if (line) {
    const [category, catalogs] = await Promise.all([
      prisma.category.findUnique({ where: { slug: MATERIAL_CATEGORY_SLUGS[material] } }),
      getSiteSetting("catalogs")
    ]);
    if (!category) notFound();

    return (
      <MaterialCatalogView
        category={category}
        material={material}
        locale={locale}
        dict={dict}
        searchParams={{ ...searchParams, line }}
        productLines={MATERIAL_PRODUCT_LINES[material]}
        catalogPdfUrl={catalogs[CATALOG_PDF_KEY[material]] || undefined}
        lineBasePath={`/${locale}/catalog/${params.material}`}
      />
    );
  }

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: true, category: true }
  });
  if (!product || product.material !== material) notFound();

  return <ProductDetailView product={product} locale={locale} dict={dict} />;
}
