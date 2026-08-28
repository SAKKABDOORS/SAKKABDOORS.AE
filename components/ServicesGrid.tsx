import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { ServicesContent } from "@/lib/siteContent";
import Reveal from "./motion/Reveal";

export default function ServicesGrid({ locale, content }: { locale: Locale; content: ServicesContent }) {
  return (
    <section className="bg-sage-300 py-16">
      <div className="container-page">
        <div className="relative mb-10 overflow-hidden text-center">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 select-none text-3xl font-extrabold uppercase tracking-widest text-white/40 sm:-top-4 sm:text-6xl lg:-top-6 lg:text-8xl"
          >
            SERVICE
          </span>
          <span className="eyebrow relative">{content.eyebrow[locale]}</span>
          <h2 className="font-display relative mt-1 text-2xl text-ink-900 sm:text-3xl">{content.heading[locale]}</h2>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2">
          {content.items.map((s, i) => (
            <Reveal key={s.key} delay={i * 0.08}>
              <Link href={`/${locale}${s.href}`} className="group flex items-center">
                <span className="relative -mt-6 h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-sage-200 shadow-md transition group-hover:-translate-y-1">
                  <Image src={s.image} alt={s.label[locale]} fill sizes="80px" className="object-cover" />
                </span>
                <span className="-ms-8 flex flex-1 items-center rounded-full bg-sage-200 py-5 ps-12 pe-6 shadow-sm transition group-hover:shadow-md">
                  <span className="text-lg font-bold text-ink-900">{s.label[locale]}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
