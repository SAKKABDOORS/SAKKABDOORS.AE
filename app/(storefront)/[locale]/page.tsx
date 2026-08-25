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
  const { hero, stats, services, quality, cta, footer } = await getAllSiteSettings();

  const categories = await prisma.category.findMany({
    where: { slug: { in: SPOTLIGHT_ORDER } }
  });
  const orderedCategories = SPOTLIGHT_ORDER.map((slug) =>
    categories.find((c) => c.slug === slug)
  ).filter((c): c is (typeof categories)[number] => Boolean(c));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sakkabdoors.ae";
  // Organization structured data — helps Google surface a knowledge-panel-
  // style entry (logo, contact points, branches) instead of a bare link.
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SAKKAB",
    url: siteUrl,
    logo: `${siteUrl}/images/logo-mark.png`,
    email: footer.email,
    contactPoint: footer.locations.map((loc) => ({
      "@type": "ContactPoint",
      telephone: `+${loc.phone}`,
      contactType: "sales",
      areaServed: loc.name[locale]
    })),
    address: footer.locations.map((loc) => ({
      "@type": "PostalAddress",
      streetAddress: loc.address[locale],
      addressLocality: loc.name[locale]
    }))
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
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
