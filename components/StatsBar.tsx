import type { Locale } from "@/lib/i18n/config";
import type { StatsContent } from "@/lib/siteContent";
import { resolveIcon } from "@/lib/icons/registry";
import StatCounter from "./StatCounter";
import Reveal from "./motion/Reveal";

export default function StatsBar({ locale, content }: { locale: Locale; content: StatsContent }) {
  return (
    <section className="bg-sage-300 py-14">
      <div className="container-page">
        <div className="relative mb-8 overflow-hidden text-center">
          {/* Oversized decorative watermark behind the heading, matching the
              brand reference — purely typographic texture, stays in Latin
              caps regardless of locale like a wordmark would. */}
          {/* Purely decorative (aria-hidden). Sized with a px/vw clamp
              instead of Tailwind's rem-based text-8xl: a fixed rem size
              rendered fine at default zoom but could overflow this box
              and clip mid-word on a device with OS-level text scaling
              turned up (rem tracks the root font size, px/vw don't) —
              this keeps it proportional to the viewport instead, and the
              "em" top offset scales together with the clamped font-size. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 select-none font-extrabold uppercase tracking-widest text-white/40"
            style={{ fontSize: "clamp(32px, 8vw, 96px)", top: "-0.3em" }}
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
