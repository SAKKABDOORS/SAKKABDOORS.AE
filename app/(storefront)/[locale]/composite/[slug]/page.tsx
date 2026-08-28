import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { firstProductImageUrl } from "@/lib/types";
import ProductDetailView from "@/components/catalog/ProductDetailView";

export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const product = await prisma.product.findUnique({ where: { slug: params.slug }, include: { images: true } });
  if (!product || product.material !== "UPVC") return {};

  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? product.descriptionAr : product.descriptionEn;
  const image = firstProductImageUrl(product.images);
  return {
    title: name,
    description,
    alternates: { languages: { ar: `/ar/composite/${params.slug}`, en: `/en/composite/${params.slug}` } },
    openGraph: { title: name, description, images: image ? [image] : undefined }
  };
}

export default async function CompositeProductPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: true, category: true }
  });
  if (!product || product.material !== "UPVC") notFound();

  return <ProductDetailView product={product} locale={locale} dict={dict} />;
}
