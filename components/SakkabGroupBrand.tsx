import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import Reveal from "./motion/Reveal";

const COPY: Record<Locale, { eyebrow: string; body: string }> = {
  ar: {
    eyebrow: "عقارات، ألمنيوم، أبواب",
    body: "تضم مجموعة سكاب ثلاث علامات متخصصة تحت مظلة واحدة — تصنيع الألمنيوم، وتصنيع الأبواب وتوريدها، والتطوير العقاري."
  },
  en: {
    eyebrow: "Real Estate, Aluminum, Doors",
    body: "SAKKAB Group brings three specialized brands under one roof — aluminum manufacturing, door manufacturing & supply, and real estate development."
  }
};

export default function SakkabGroupBrand({ locale }: { locale: Locale }) {
  const copy = COPY[locale];

  return (
    <section className="bg-sage-300 py-14">
      <div className="container-page">
      <Reveal>
        <div className="grid items-center gap-8 rounded-xl2 bg-white p-8 shadow-sm ring-1 ring-brand-100 sm:p-12 lg:grid-cols-2">
          <div className={locale === "ar" ? "lg:order-2" : "lg:order-1"}>
            <span className="eyebrow">{copy.eyebrow}</span>
            <p className="mt-3 max-w-md text-ink-800/80">{copy.body}</p>
          </div>
          <div className={locale === "ar" ? "lg:order-1" : "lg:order-2"}>
            <div className="relative mx-auto aspect-[645/340] w-full max-w-md">
              <Image
                src="/images/sakkab-group-logos.png"
                alt="SAKKAB Aluminum · SAKKAB Doors · SAKKAB Real Estate"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </Reveal>
      </div>
    </section>
  );
}
