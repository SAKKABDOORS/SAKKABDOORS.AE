"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { HeroContent } from "@/lib/siteContent";
import { parseYouTubeId, buildYouTubeBackgroundEmbedUrl } from "@/lib/youtube";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function Hero({
  dict,
  locale,
  content
}: {
  dict: Dictionary;
  locale: Locale;
  content: HeroContent;
}) {
  const title = content[locale].title;
  const subtitle = content[locale].subtitle;
  const youtubeId = content.backgroundType === "video" ? parseYouTubeId(content.backgroundVideo) : null;
  const isDirectVideo = content.backgroundType === "video" && content.backgroundVideo && !youtubeId;

  return (
    <section className="relative overflow-hidden">
      {/* Background photo, a looping muted <video>, or a YouTube embed
          (iframes have no object-fit, so we oversize + center it using the
          standard 16:9 "cover" math) + dark gradient overlay */}
      <div className="absolute inset-0">
        {youtubeId ? (
          <iframe
            src={buildYouTubeBackgroundEmbedUrl(youtubeId)}
            title=""
            allow="autoplay; encrypted-media"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
          />
        ) : isDirectVideo ? (
          <video
            src={content.backgroundVideo}
            poster={content.backgroundImage}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={content.backgroundImage}
            alt=""
            className="h-full w-full origin-center object-cover animate-hero-zoom"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/60 to-ink-900/40" />
      </div>

      <div className="container-page relative py-24 sm:py-32">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl">
          <motion.h1
            variants={item}
            className="font-display text-5xl text-white sm:text-7xl"
          >
            {title}
          </motion.h1>
          <motion.p variants={item} className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            {subtitle}
          </motion.p>
          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/contact`} className="btn-outline-light">
              {dict.hero.cta_contact}
            </Link>
            <Link href={`/${locale}/products`} className="btn-primary">
              {dict.hero.cta_products}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
