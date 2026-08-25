import type { Locale } from "@/lib/i18n/config";
import type { QualityContent } from "@/lib/siteContent";
import { resolveIcon } from "@/lib/icons/registry";
import Reveal from "./motion/Reveal";

export default function QualityFeatures({ locale, content }: { locale: Locale; content: QualityContent }) {
  return (
    <section className="bg-sage-300 py-14">
      <div className="container-page">
        {content.eyebrow[locale] && (
          <div className="mb-8 text-center text-sm font-semibold uppercase tracking-wide text-brand-800/70">
            {content.eyebrow[locale]}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {content.items.map((item, i) => {
            const Icon = resolveIcon(item.icon);
            return (
              <Reveal key={item.title[locale]} delay={i * 0.1}>
                <div className="flex items-center gap-4 rounded-xl2 bg-sand-300 p-5">
                  <Icon className="h-9 w-9 shrink-0 text-ink-900" strokeWidth={1.5} />
                  <div>
                    <div className="font-bold text-ink-900">{item.title[locale]}</div>
                    <div className="text-sm text-ink-800/70">{item.body[locale]}</div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
