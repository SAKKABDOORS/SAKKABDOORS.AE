import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CtaContent } from "@/lib/siteContent";
import Reveal from "./motion/Reveal";

export default function CTASection({
  dict,
  locale,
  content
}: {
  dict: Dictionary;
  locale: Locale;
  content: CtaContent;
}) {
  return (
    <section className="bg-sage-300 py-14">
      <div className="container-page">
      <Reveal>
        <div className="rounded-xl2 bg-sand-300 px-6 py-14 text-center sm:px-16">
          <h2 className="font-display text-3xl text-ink-900 sm:text-5xl">{content.title[locale]}</h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-800/80">{content.subtitle[locale]}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={`/${locale}/catalog`} className="btn-secondary">
              {dict.cta.catalog}
            </Link>
            <Link href={`/${locale}/contact`} className="btn-primary">
              {dict.cta.contact}
            </Link>
          </div>
        </div>
      </Reveal>
      </div>
    </section>
  );
}
