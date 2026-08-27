import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Category } from "@/lib/types";
import Reveal from "./motion/Reveal";

export default function CategorySpotlight({
  category,
  dict,
  locale,
  reverse = false
}: {
  category: Category;
  dict: Dictionary;
  locale: Locale;
  reverse?: boolean;
}) {
  const name = locale === "ar" ? category.nameAr : category.nameEn;
  const words = name.split(" ");
  // English names lead with the specific term ("WPC Doors") so the accent
  // word is first; Arabic names lead with the generic term ("أبواب WPC")
  // so the accent word is last. Render every word in its natural reading
  // order and just color whichever one is the accent.
  const accentIndex = locale === "en" ? 0 : words.length - 1;
  const tagline = locale === "ar" ? category.taglineAr : category.taglineEn;
  const description = locale === "ar" ? category.descriptionAr : category.descriptionEn;
  const image = category.heroImage ?? "/images/placeholder-door.svg";

  return (
    <section className="bg-sage-300 py-14">
      <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal className={reverse ? "lg:order-2" : "lg:order-1"}>
          <h2 className="font-display text-3xl leading-tight sm:text-5xl">
            {words.map((word, i) => (
              <span key={i} className={i === accentIndex ? "text-brand-600" : "text-ink-900"}>
                {word}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </h2>
          {tagline && <p className="mt-2 text-sm font-semibold text-ink-800/70">{tagline}</p>}
          {description && (
            <p className="mt-4 max-w-lg text-ink-800/80">&ldquo;{description}&rdquo;</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${locale}/products/${category.slug}`} className="btn-pill-solid">
              {dict.spotlight.shop_now}
            </Link>
            <Link href={`/${locale}/products/${category.slug}`} className="btn-pill-outline">
              {dict.spotlight.details}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className={reverse ? "lg:order-1" : "lg:order-2"}>
          {/* Un-framed product shot with a soft floating shadow — no
              card/crop around the photo itself, unlike the grid thumbnails
              elsewhere on the site. */}
          <div className="relative mx-auto aspect-[4/3] w-full max-w-md drop-shadow-[0_25px_35px_rgba(25,49,35,0.35)]">
            <img src={image} alt={name} className="h-full w-full object-contain" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
