import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import RealEstateFilters from "@/components/RealEstateFilters";
import PropertyCard from "@/components/PropertyCard";
import Reveal from "@/components/motion/Reveal";

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
