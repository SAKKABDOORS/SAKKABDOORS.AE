import { z } from "zod";
import { prisma } from "./prisma";
import arDict from "./i18n/dictionaries/ar.json";
import enDict from "./i18n/dictionaries/en.json";

const bilingualText = z.object({ ar: z.string().min(1), en: z.string().min(1) });

export const brandingContentSchema = z.object({
  logoUrl: z.string().min(1)
});

export const heroContentSchema = z.object({
  ar: z.object({ title: z.string().min(1), subtitle: z.string().min(1) }),
  en: z.object({ title: z.string().min(1), subtitle: z.string().min(1) }),
  // Background is either a static image, or a looping muted video with the
  // image kept as its poster frame (shown while the video loads / if it
  // fails) — see Hero.tsx.
  backgroundType: z.enum(["image", "video"]).default("image"),
  backgroundImage: z.string().url(),
  backgroundVideo: z.string().url().optional()
});

export const statsContentSchema = z.object({
  heading: bilingualText,
  items: z
    .array(z.object({ icon: z.string(), value: z.string().min(1), label: bilingualText }))
    .length(3)
});

export const servicesContentSchema = z.object({
  eyebrow: bilingualText,
  heading: bilingualText,
  // Reference design shows a real photo per card here (not an icon) — see
  // ServicesGrid.tsx.
  items: z
    .array(z.object({ key: z.string(), image: z.string().url(), label: bilingualText, href: z.string() }))
    .length(4)
});

export const qualityContentSchema = z.object({
  // Allowed empty: the reference design has no eyebrow label above this
  // section (unlike stats/services), so the default seeds it blank.
  eyebrow: z.object({ ar: z.string(), en: z.string() }),
  items: z
    .array(z.object({ icon: z.string(), title: bilingualText, body: bilingualText }))
    .length(3)
});

export const ctaContentSchema = z.object({
  title: bilingualText,
  subtitle: bilingualText
});

// Empty string = hide that icon — the admin fills these in from
// /admin/content once real page URLs are available, nothing shows a
// dead/placeholder link in the meantime.
const socialLinksSchema = z
  .object({
    facebook: z.string(),
    instagram: z.string(),
    youtube: z.string(),
    linkedin: z.string()
  })
  .default({ facebook: "", instagram: "", youtube: "", linkedin: "" });

export const footerContentSchema = z.object({
  email: z.string().email(),
  locations: z
    .array(
      z.object({
        icon: z.string(),
        name: bilingualText,
        address: bilingualText,
        phone: z.string().min(1)
      })
    )
    .length(3),
  social: socialLinksSchema
});

export const SITE_SETTING_SCHEMAS = {
  branding: brandingContentSchema,
  hero: heroContentSchema,
  stats: statsContentSchema,
  services: servicesContentSchema,
  quality: qualityContentSchema,
  cta: ctaContentSchema,
  footer: footerContentSchema
} as const;

export type SiteSettingKey = keyof typeof SITE_SETTING_SCHEMAS;
export type BrandingContent = z.infer<typeof brandingContentSchema>;
export type HeroContent = z.infer<typeof heroContentSchema>;
export type StatsContent = z.infer<typeof statsContentSchema>;
export type ServicesContent = z.infer<typeof servicesContentSchema>;
export type QualityContent = z.infer<typeof qualityContentSchema>;
export type CtaContent = z.infer<typeof ctaContentSchema>;
export type FooterContent = z.infer<typeof footerContentSchema>;

// The current static dictionaries are the seed/fallback values — a fresh or
// not-yet-seeded DB (or one missing a specific key) still renders sane
// content instead of crashing.
export const SITE_SETTING_DEFAULTS: {
  branding: BrandingContent;
  hero: HeroContent;
  stats: StatsContent;
  services: ServicesContent;
  quality: QualityContent;
  cta: CtaContent;
  footer: FooterContent;
} = {
  branding: {
    logoUrl: "/images/logo-mark.png"
  },
  hero: {
    ar: { title: arDict.hero.title, subtitle: arDict.hero.subtitle },
    en: { title: enDict.hero.title, subtitle: enDict.hero.subtitle },
    backgroundType: "image",
    backgroundImage: "https://images.unsplash.com/photo-1778159396492-b9a89e6d99f2?w=1600",
    backgroundVideo: undefined
  },
  stats: {
    heading: { ar: arDict.stats.heading, en: enDict.stats.heading },
    items: [
      { icon: "award", value: arDict.stats.years_value, label: { ar: arDict.stats.years_label, en: enDict.stats.years_label } },
      { icon: "building-2", value: arDict.stats.projects_value, label: { ar: arDict.stats.projects_label, en: enDict.stats.projects_label } },
      { icon: "users", value: arDict.stats.customers_value, label: { ar: arDict.stats.customers_label, en: enDict.stats.customers_label } }
    ]
  },
  services: {
    eyebrow: { ar: arDict.services.eyebrow, en: enDict.services.eyebrow },
    heading: { ar: arDict.services.heading, en: enDict.services.heading },
    items: [
      { key: "aluminum", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600", label: { ar: arDict.services.aluminum, en: enDict.services.aluminum }, href: "/products?material=ALUMINUM" },
      { key: "doors", image: "https://images.unsplash.com/photo-1770756051811-1612ac8bedfa?w=600", label: { ar: arDict.services.doors, en: enDict.services.doors }, href: "/products" },
      { key: "real_estate", image: "https://images.unsplash.com/photo-1541976590-713941681591?w=600", label: { ar: arDict.services.real_estate, en: enDict.services.real_estate }, href: "/realestate" },
      { key: "wpc", image: "https://images.unsplash.com/photo-1636320806984-ecc0576ff328?w=600", label: { ar: arDict.services.wpc, en: enDict.services.wpc }, href: "/products?material=WPC" }
    ]
  },
  quality: {
    eyebrow: { ar: "", en: "" },
    items: [
      { icon: "check-circle", title: { ar: arDict.quality.q1_title, en: enDict.quality.q1_title }, body: { ar: arDict.quality.q1_body, en: enDict.quality.q1_body } },
      { icon: "shield-check", title: { ar: arDict.quality.q2_title, en: enDict.quality.q2_title }, body: { ar: arDict.quality.q2_body, en: enDict.quality.q2_body } },
      { icon: "sparkles", title: { ar: arDict.quality.q3_title, en: enDict.quality.q3_title }, body: { ar: arDict.quality.q3_body, en: enDict.quality.q3_body } }
    ]
  },
  cta: {
    title: { ar: arDict.cta.title, en: enDict.cta.title },
    subtitle: { ar: arDict.cta.subtitle, en: enDict.cta.subtitle }
  },
  footer: {
    email: "info@sakkabdoors.ae",
    locations: [
      { icon: "map-pin", name: { ar: arDict.footer.location_ad, en: "UAE - Abu Dhabi" }, address: { ar: arDict.footer.location_ad_address, en: "Mohammed Bin Zayed City, Popular 12" }, phone: "00971508838615" },
      { icon: "map-pin", name: { ar: arDict.footer.location_ain, en: "UAE - Al Ain" }, address: { ar: arDict.footer.location_ain_address, en: "Al Noud Companies" }, phone: "00971508838054" },
      { icon: "map-pin", name: { ar: arDict.footer.location_sy, en: "Syria" }, address: { ar: arDict.footer.location_sy_address, en: "Damascus - Sahnaya" }, phone: "00963984733335" }
    ],
    social: { facebook: "", instagram: "", youtube: "", linkedin: "" }
  }
};

export async function getSiteSetting<K extends SiteSettingKey>(key: K): Promise<(typeof SITE_SETTING_DEFAULTS)[K]> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if (!row) return SITE_SETTING_DEFAULTS[key];
    const schema = SITE_SETTING_SCHEMAS[key];
    const raw = JSON.parse(row.value);
    const parsed = schema.safeParse(raw);
    return parsed.success ? (parsed.data as (typeof SITE_SETTING_DEFAULTS)[K]) : SITE_SETTING_DEFAULTS[key];
  } catch {
    // DB not reachable, table not migrated yet, or the stored value is
    // malformed JSON — never break the homepage over it.
    return SITE_SETTING_DEFAULTS[key];
  }
}

export async function getAllSiteSettings() {
  const [branding, hero, stats, services, quality, cta, footer] = await Promise.all([
    getSiteSetting("branding"),
    getSiteSetting("hero"),
    getSiteSetting("stats"),
    getSiteSetting("services"),
    getSiteSetting("quality"),
    getSiteSetting("cta"),
    getSiteSetting("footer")
  ]);
  return { branding, hero, stats, services, quality, cta, footer };
}
