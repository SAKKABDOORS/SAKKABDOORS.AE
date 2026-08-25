import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import ProductFilters from "@/components/ProductFilters";
import ProductCatalogView from "@/components/ProductCatalogView";
import Reveal from "@/components/motion/Reveal";
import type { Material } from "@/lib/types";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = await getDictionary(locale);
  const description =
    locale === "ar"
      ? "تصفح كتالوج أبواب سكاب — WPC، UPVC، وألمنيوم — بأعلى معايير الجودة والتصميم."
      : "Browse the SAKKAB door catalog — WPC, UPVC, and Aluminum — engineered to the highest quality and design standards.";
  return {
    title: dict.products.title,
    description,
    alternates: { languages: { ar: "/ar/products", en: "/en/products" } },
    openGraph: { title: dict.products.title, description }
  };
}

export default async function ProductsPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: { category?: string; material?: string; sort?: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  const categories = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });

  const where: Record<string, unknown> = {};
  if (searchParams.category) {
    const cat = categories.find((c) => c.slug === searchParams.category);
    if (cat) where.categoryId = cat.id;
  }
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

  return (
    <div>
      <div className="bg-sage-300 py-10">
        <div className="container-page">
          <Reveal>
            <span className="eyebrow">{dict.products.eyebrow}</span>
            <h1 className="font-display mb-6 mt-2 text-2xl text-ink-900 sm:text-4xl">{dict.products.title}</h1>
            <ProductFilters categories={categories} locale={locale} dict={dict} />
          </Reveal>
        </div>
      </div>

      <div className="container-page py-10">
        <ProductCatalogView products={products} locale={locale} dict={dict} />
      </div>
    </div>
  );
}
