import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import Reveal from "@/components/motion/Reveal";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = await getDictionary(locale);
  return {
    title: dict.products.title,
    description: dict.products.choose_section,
    alternates: { languages: { ar: "/ar/catalog", en: "/en/catalog" } },
    openGraph: { title: dict.products.title, description: dict.products.choose_section }
  };
}

export default async function CatalogChooserPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  const [categories, firstProperty] = await Promise.all([
    prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.property.findFirst({ include: { images: true }, orderBy: { createdAt: "asc" } })
  ]);

  const bySlug = (slug: string) => categories.find((c) => c.slug === slug);
  const wpc = bySlug("wpc-doors");
  const aluminum = bySlug("aluminum-doors");
  const composite = bySlug("upvc-doors");
  const realEstateImage = firstProperty?.images[0]?.url;

  type Card = { href: string; name: string; image: string | undefined };
  const cards: Card[] = [];
  if (wpc) {
    cards.push({ href: `/${locale}/wpc`, name: locale === "ar" ? wpc.nameAr : wpc.nameEn, image: wpc.heroImage ?? undefined });
  }
  if (composite) {
    cards.push({
      href: `/${locale}/composite`,
      name: locale === "ar" ? composite.nameAr : composite.nameEn,
      image: composite.heroImage ?? undefined
    });
  }
  if (aluminum) {
    cards.push({
      href: `/${locale}/aluminum`,
      name: locale === "ar" ? aluminum.nameAr : aluminum.nameEn,
      image: aluminum.heroImage ?? undefined
    });
  }
  cards.push({ href: `/${locale}/realestate`, name: dict.realestate.title, image: realEstateImage });

  return (
    <div className="container-page py-16">
      <Reveal>
        <span className="eyebrow">{dict.products.eyebrow}</span>
        <h1 className="font-display mb-2 mt-2 text-3xl text-ink-900 sm:text-5xl">{dict.products.title}</h1>
        <p className="mb-10 max-w-xl text-ink-800/70">{dict.products.choose_section}</p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <Reveal key={card.href} delay={i * 0.08}>
            <Link href={card.href} className="card-interactive group block overflow-hidden">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-100">
                {card.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.image}
                    alt={card.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-sage-300 text-ink-800/40">
                    {card.name}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-4">
                <h2 className="font-semibold text-ink-900">{card.name}</h2>
                <span className="text-sm font-medium text-brand-600">{dict.products.explore_section}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
