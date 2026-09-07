import { z } from "zod";
import { prisma } from "./prisma";
import arDict from "./i18n/dictionaries/ar.json";
import enDict from "./i18n/dictionaries/en.json";

const bilingualText = z.object({ ar: z.string().min(1), en: z.string().min(1) });

export const brandingContentSchema = z.object({
  logoUrl: z.string().min(1),
  // SAKKAB Group logos image on the homepage — was a hardcoded file path,
  // now admin-editable like every other homepage image.
  groupImage: z.string().min(1).default("/images/sakkab-group-brand.jpg")
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
    linkedin: z.string(),
    // .default() on these two individually (not just on the object as a
    // whole) so footer rows saved before TikTok/X existed still parse
    // instead of silently reverting the whole footer to defaults.
    tiktok: z.string().default(""),
    twitter: z.string().default("")
  })
  .default({ facebook: "", instagram: "", youtube: "", linkedin: "", tiktok: "", twitter: "" });

// A separate "something's broken with the site itself" contact — distinct
// from the 3 sales branches above, so it's never confused with them. The
// default (used whenever a stored footer row predates this field — i.e.
// every row that already existed in the DB before this was added) is the
// real number, not empty, so it appears without needing a one-off DB
// write; the admin can still blank it from /admin/content to hide it.
const techSupportSchema = z
  .object({ name: z.string().default("علاء الحسن"), phone: z.string() })
  .default({ name: "علاء الحسن", phone: "00963980966695" });

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
  social: socialLinksSchema,
  techSupport: techSupportSchema
});

// Free-form photo/video gallery for the About page — empty by default so
// nothing shows until the admin adds something from /admin/content.
// "video" items accept either a YouTube URL or a direct video file URL,
// same convention as the hero background video.
export const aboutMediaContentSchema = z.object({
  items: z
    .array(
      z.object({
        type: z.enum(["image", "video"]),
        url: z.string().min(1),
        title: z.string().default(""),
        description: z.string().default("")
      })
    )
    .max(12)
});

// One PDF slot per catalog section — admin-uploaded (not auto-generated
// from the live product data, unlike /api/admin/catalog-pdf), shown as a
// "Download Catalog" button on that section's page only once uploaded.
export const catalogsContentSchema = z.object({
  wpc: z.string().default(""),
  aluminum: z.string().default(""),
  composite: z.string().default(""),
  realestate: z.string().default("")
});

// Default bilingual terms text pre-filled onto every new price quote (see
// /admin/quotes) — editable per-quote afterward without affecting this
// site-wide default, and this default itself only editable from
// /admin/content (SUPER_ADMIN only).
export const quoteTermsContentSchema = bilingualText;

export const SITE_SETTING_SCHEMAS = {
  branding: brandingContentSchema,
  hero: heroContentSchema,
  stats: statsContentSchema,
  services: servicesContentSchema,
  quality: qualityContentSchema,
  cta: ctaContentSchema,
  footer: footerContentSchema,
  about_media: aboutMediaContentSchema,
  catalogs: catalogsContentSchema,
  quoteTerms: quoteTermsContentSchema
} as const;

export type SiteSettingKey = keyof typeof SITE_SETTING_SCHEMAS;
export type BrandingContent = z.infer<typeof brandingContentSchema>;
export type HeroContent = z.infer<typeof heroContentSchema>;
export type StatsContent = z.infer<typeof statsContentSchema>;
export type ServicesContent = z.infer<typeof servicesContentSchema>;
export type QualityContent = z.infer<typeof qualityContentSchema>;
export type CtaContent = z.infer<typeof ctaContentSchema>;
export type FooterContent = z.infer<typeof footerContentSchema>;
export type AboutMediaContent = z.infer<typeof aboutMediaContentSchema>;
export type CatalogsContent = z.infer<typeof catalogsContentSchema>;
export type QuoteTermsContent = z.infer<typeof quoteTermsContentSchema>;

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
  about_media: AboutMediaContent;
  catalogs: CatalogsContent;
  quoteTerms: QuoteTermsContent;
} = {
  branding: {
    logoUrl: "/images/logo-mark.png",
    groupImage: "/images/sakkab-group-brand.jpg"
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
      { key: "aluminum", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600", label: { ar: arDict.services.aluminum, en: enDict.services.aluminum }, href: "/catalog/aluminum" },
      { key: "doors", image: "https://images.unsplash.com/photo-1770756051811-1612ac8bedfa?w=600", label: { ar: arDict.services.doors, en: enDict.services.doors }, href: "/catalog/composite" },
      { key: "real_estate", image: "https://images.unsplash.com/photo-1541976590-713941681591?w=600", label: { ar: arDict.services.real_estate, en: enDict.services.real_estate }, href: "/realestate" },
      { key: "wpc", image: "https://images.unsplash.com/photo-1636320806984-ecc0576ff328?w=600", label: { ar: arDict.services.wpc, en: enDict.services.wpc }, href: "/catalog/wpc" }
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
    social: { facebook: "", instagram: "", youtube: "", linkedin: "", tiktok: "", twitter: "" },
    techSupport: { name: "علاء الحسن", phone: "00963980966695" }
  },
  about_media: {
    items: []
  },
  catalogs: {
    wpc: "",
    aluminum: "",
    composite: "",
    realestate: ""
  },
  quoteTerms: {
    ar:
      "1- مدة التوريد والتركيب 40 يوم من تاريخ جهوزية الموقع و دفع الدفعة الأولى\n\n" +
      "2- ينبغي أن يكون عرض جانبي الباب على الأقل 10 سم و خلافه يتم قص الحاجب على الأصول. يجب أن تُترك نهاية الباب والبرطاش بعد تركيب الباب أو يتم تركيب الباب فوق النعلة والبرطاش\n\n" +
      "3- تعتبر الأعمال المتفق عليها قد تم تسليمها بعد يومين من انتهاء التركيب إذا لم يبدِ المالك أو المهندس المسؤول عن المشروع أي ملاحظة\n\n" +
      "4- يجب على العميل توفير الكهرباء في الموقع عند التركيب\n\n" +
      "5- في حال عدم جهوزية العميل لن يتم التركيب لكي لا تتضرر الأبواب. وفي حال إصرار العميل على التركيب شركة سكاب لن تتحمل مسؤولية تضرر الأبواب و يجب على العميل والمهندس المسؤول توضيع خط لإخلاء مسؤولية شركة سكاب\n\n" +
      "6- الضمان يشمل البضاعة خلال الفترة المحددة والتي هي خمس سنوات من تاريخ التركيب وتاريخ الدفعة الأخيرة، والكفالة لاتشمل الأضرار المتعمدة وسوء الاستخدام\n\n" +
      "7- يتكفل العميل بتكاليف الأضرار من سوء الاستخدام وتكاليف النقل والإصلاح\n\n" +
      "8- جميع أبواب الديبلو بي سي إنتاج و صناعة إماراتية بمواصفات خليجية\n\n" +
      "9- الدفعة الأولى 50% من قيمة العقد عند التوقيع. الدفعة الثانية 50% من قيمة العقد قبل التركيب ب 15 يوم\n\n" +
      "10- بعد توقيع العقد، سيبدأ إنتاج البضاعة ولا يجوز استرداد الدفعة الأولى أو إلغاء أي من الأبواب المعتمدة",
    en:
      "1- The duration of supply and installation is 40 days from the date the site is ready and the first payment is paid\n\n" +
      "2- The width of the two sides of the doors should be at least 10 cm and otherwise the frame is cut on the insole. The lower door threshold must be installed after installing the door, or the door is installed on the insole door and the threshold door\n\n" +
      "3- Agreed works are considered to have been delivered two days after completion of installation if the customer or engineer responsible for the project do not make any comment\n\n" +
      "4- The customer must provide electricity at the site upon installation\n\n" +
      "5- If the site is not ready, the installation will not be done so that the doors are not damaged. If the customer insists on installation, SAKKAB will not be responsible for the doors damaged, and the customer and the engineer must sign a written letter disclaiming SAKKAB company's responsibility\n\n" +
      "6- The warranty includes the goods during the specified period, which is five years from the date of installation and the date of the last payment. The warranty does not cover intentional damage and misuse\n\n" +
      "7- The customer bears the costs of damage from misuse, transportation and repair costs\n\n" +
      "8- All WPC doors are Emirati production and manufacture, with Emirati specifications\n\n" +
      "9- The first payment at signing (50% of the contract value). The second payment is 15 days before installation (50% of the contract value)\n\n" +
      "10- After signing the contract, manufacturing will begin. The down payment cannot be refunded or any of the doors cancelled"
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
