import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import MaterialCatalogView from "@/components/catalog/MaterialCatalogView";
import { MATERIAL_PRODUCT_LINES } from "@/lib/productLines";

const CATEGORY_SLUG = "wpc-doors";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const category = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG } });
  if (!category) return {};
  const name = locale === "ar" ? category.nameAr : category.nameEn;
  const description =
    (locale === "ar" ? category.descriptionAr : category.descriptionEn) ??
    (locale === "ar" ? category.taglineAr : category.taglineEn) ??
    name;
  return {
    title: name,
    description,
    alternates: { languages: { ar: "/ar/wpc", en: "/en/wpc" } },
    openGraph: { title: name, description, images: category.heroImage ? [category.heroImage] : undefined }
  };
}

export default async function WpcCatalogPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: { sort?: string; line?: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  const category = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG } });
  if (!category) notFound();

  return (
    <MaterialCatalogView
      category={category}
      material="WPC"
      locale={locale}
      dict={dict}
      searchParams={searchParams}
      productLines={MATERIAL_PRODUCT_LINES.WPC}
    />
  );
}
