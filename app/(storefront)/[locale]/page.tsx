import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { getAllSiteSettings } from "@/lib/siteContent";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import ServicesGrid from "@/components/ServicesGrid";
import CategorySpotlight from "@/components/CategorySpotlight";
import BrandStatement from "@/components/BrandStatement";
import SakkabGroupBrand from "@/components/SakkabGroupBrand";
import QualityFeatures from "@/components/QualityFeatures";
import CTASection from "@/components/CTASection";

const SPOTLIGHT_ORDER = ["wpc-doors", "upvc-doors", "aluminum-doors"];

export default async function HomePage({
  params
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const { hero, stats, services, quality, cta } = await getAllSiteSettings();

  const categories = await prisma.category.findMany({
    where: { slug: { in: SPOTLIGHT_ORDER } }
  });
  const orderedCategories = SPOTLIGHT_ORDER.map((slug) =>
    categories.find((c) => c.slug === slug)
  ).filter((c): c is (typeof categories)[number] => Boolean(c));

  return (
    <div>
      <Hero dict={dict} locale={locale} content={hero} />
      <StatsBar locale={locale} content={stats} />
      <ServicesGrid locale={locale} content={services} />

      {orderedCategories.map((category, i) => (
        <CategorySpotlight
          key={category.id}
          category={category}
          dict={dict}
          locale={locale}
          reverse={i % 2 === 1}
        />
      ))}

      <BrandStatement locale={locale} />
      <SakkabGroupBrand locale={locale} />
      <QualityFeatures locale={locale} content={quality} />
      <CTASection dict={dict} locale={locale} content={cta} />
    </div>
  );
}
