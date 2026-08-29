import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import RealEstateFilters from "@/components/RealEstateFilters";
import PropertyCard from "@/components/PropertyCard";
import Reveal from "@/components/motion/Reveal";
import { getSiteSetting } from "@/lib/siteContent";
import { Download } from "lucide-react";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = await getDictionary(locale);
  const description =
    locale === "ar"
      ? "استكشف فرص عقارية مختارة من مجموعة سكاب في الإمارات وسوريا — شقق وفلل وأراضٍ بمناطق متعددة."
      : "Explore curated real estate opportunities from SAKKAB Group across the UAE and Syria — apartments, villas, and land across multiple regions.";
  return {
    title: dict.realestate.title,
    description,
    alternates: { languages: { ar: "/ar/realestate", en: "/en/realestate" } },
    openGraph: { title: dict.realestate.title, description }
  };
}

export default async function RealEstatePage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: { region?: string; sort?: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  const catalogs = await getSiteSetting("catalogs");
  const allProperties = await prisma.property.findMany({ select: { regionAr: true, regionEn: true } });
  const uniqueRegions = Array.from(new Map(allProperties.map((p) => [p.regionAr, p])).values());
  const regions = uniqueRegions.map((r) => ({ ar: r.regionAr, en: r.regionEn }));

  const where: Record<string, unknown> = {};
  if (searchParams.region) {
    where.regionAr = searchParams.region;
  }

  const orderBy =
    searchParams.sort === "price_asc"
      ? { price: "asc" as const }
      : searchParams.sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const properties = await prisma.property.findMany({
    where,
    include: { images: true },
    orderBy
  });

  return (
    <div>
      <div className="bg-sage-300 py-10">
        <div className="container-page">
          <Reveal>
            <span className="eyebrow">{dict.realestate.eyebrow}</span>
            <h1 className="font-display mb-6 mt-2 text-2xl text-ink-900 sm:text-4xl">{dict.realestate.title}</h1>
            <RealEstateFilters regions={regions} locale={locale} dict={dict} />
            {catalogs.realestate && (
              <a
                href={catalogs.realestate}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-4 inline-flex"
              >
                <Download className="h-4 w-4" />
                {dict.products.download_catalog}
              </a>
            )}
          </Reveal>
        </div>
      </div>

      <div className="container-page py-10">
        {properties.length === 0 ? (
          <p className="py-16 text-center text-ink-800/60">{dict.realestate.no_results}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p, i) => (
              <Reveal key={p.id} delay={Math.min((i % 6) * 0.06, 0.3)}>
                <PropertyCard property={p} locale={locale} dict={dict} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
