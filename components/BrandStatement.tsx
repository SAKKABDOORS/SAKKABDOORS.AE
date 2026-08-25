import type { Locale } from "@/lib/i18n/config";
import Reveal from "./motion/Reveal";

// A single confident editorial moment — no cards, no icons, just a large
// bilingual statement — deliberately breaking the run of same-toned
// (sage-300) sections above and below it (Services, the 3 CategorySpotlights,
// SakkabGroupBrand, QualityFeatures) with a dark beat, the way a magazine
// spread interrupts a grid with one big pull-quote page.
const COPY: Record<Locale, { line1: string; line2: string; support: string }> = {
  ar: {
    line1: "أبواب تُصنع لتدوم.",
    line2: "عقارات تُبنى لتُورَّث.",
    support:
      "من مصنعنا في الإمارات إلى مشاريعنا في المنطقة — نفس المعيار الذي لا يساوم."
  },
  en: {
    line1: "Doors built to last.",
    line2: "Properties built to endure.",
    support: "From our UAE workshop to our projects across the region — one uncompromising standard."
  }
};

export default function BrandStatement({ locale }: { locale: Locale }) {
  const copy = COPY[locale];

  return (
    <section className="bg-brand-900 py-20 sm:py-28">
      <div className="container-page text-center">
        <Reveal>
          <p className="font-display text-3xl text-white sm:text-5xl lg:text-6xl">
            {copy.line1}
            <br />
            <span className="text-sage-300">{copy.line2}</span>
          </p>
          <p className="mx-auto mt-6 max-w-lg text-sm text-white/70 sm:text-base">{copy.support}</p>
        </Reveal>
      </div>
    </section>
  );
}
