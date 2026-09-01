import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import MaterialCatalogView from "@/components/catalog/MaterialCatalogView";
import { MATERIAL_PRODUCT_LINES } from "@/lib/productLines";
import { getSiteSetting } from "@/lib/siteContent";
import { resolveCatalogMaterial, MATERIAL_CATEGORY_SLUGS, MATERIAL_SLUGS, CATALOG_PDF_KEY } from "@/lib/materialPaths";

export async function generateMetadata({
  params
}: {
  params: { locale: string; material: string };
}): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const material = resolveCatalogMaterial(params.material);
  if (!material) return {};

  const category = await prisma.category.findUnique({ where: { slug: MATERIAL_CATEGORY_SLUGS[material] } });
  if (!category) return {};

  const name = locale === "ar" ? category.nameAr : category.nameEn;
  const description =
    (locale === "ar" ? category.descriptionAr : category.descriptionEn) ??
    (locale === "ar" ? category.taglineAr : category.taglineEn) ??
    name;
  const path = `/${MATERIAL_SLUGS[material]}`;
  return {
    title: name,
    description,
    alternates: { languages: { ar: `/ar/catalog${path}`, en: `/en/catalog${path}` } },
    openGraph: { title: name, description, images: category.heroImage ? [category.heroImage] : undefined }
  };
}

export default async function MaterialCatalogPage({
  params,
  searchParams
}: {
  params: { locale: string; material: string };
  searchParams: { sort?: string; line?: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const material = resolveCatalogMaterial(params.material);
  if (!material) notFound();

  const dict = await getDictionary(locale);
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
      searchParams={searchParams}
      productLines={MATERIAL_PRODUCT_LINES[material]}
      catalogPdfUrl={catalogs[CATALOG_PDF_KEY[material]] || undefined}
      lineBasePath={`/${locale}/catalog/${params.material}`}
    />
  );
}
