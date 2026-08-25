import type { Locale } from "@/lib/i18n/config";
import type { StatsContent } from "@/lib/siteContent";
import { resolveIcon } from "@/lib/icons/registry";
import StatCounter from "./StatCounter";
import Reveal from "./motion/Reveal";

export default function StatsBar({ locale, content }: { locale: Locale; content: StatsContent }) {
  return (
    <section className="bg-sage-300 py-14">
      <div className="container-page">
        <div className="relative mb-8 text-center">
          {/* Oversized decorative watermark behind the heading, matching the
              brand reference — purely typographic texture, stays in Latin
              caps regardless of locale like a wordmark would. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-6 select-none text-6xl font-extrabold uppercase tracking-widest text-white/40 sm:-top-8 sm:text-8xl"
          >
            EXPERIENCE
          </span>
          <h2 className="font-display relative text-2xl text-ink-900 sm:text-3xl">
            {content.heading[locale]}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {content.items.map((s, i) => {
            const Icon = resolveIcon(s.icon);
            return (
              <Reveal key={s.label[locale]} delay={i * 0.1}>
                <div className="rounded-xl2 bg-sage-200 p-8 text-center shadow-sm">
                  <div className="text-4xl font-extrabold text-brand-800">
                    <StatCounter value={s.value} />
                  </div>
                  <div className="mt-2 text-sm font-medium text-ink-800/80">{s.label[locale]}</div>
                  <Icon className="mx-auto mt-3 h-8 w-8 text-ink-900" strokeWidth={1.5} />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
