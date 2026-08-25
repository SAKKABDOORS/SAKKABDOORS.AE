import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import CareersView from "@/components/CareersView";
import Reveal from "@/components/motion/Reveal";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = await getDictionary(locale);
  return {
    title: dict.careers.title,
    description: dict.careers.subtitle,
    alternates: { languages: { ar: "/ar/careers", en: "/en/careers" } },
    openGraph: { title: dict.careers.title, description: dict.careers.subtitle }
  };
}

export default async function CareersPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="container-page py-16">
      <Reveal>
        <span className="eyebrow">{dict.careers.eyebrow}</span>
        <h1 className="font-display mb-2 mt-2 text-3xl text-ink-900 sm:text-5xl">{dict.careers.title}</h1>
        <p className="mb-10 max-w-xl text-ink-800/70">{dict.careers.subtitle}</p>
      </Reveal>

      <CareersView jobs={jobs} dict={dict} locale={locale} />
    </div>
  );
}
