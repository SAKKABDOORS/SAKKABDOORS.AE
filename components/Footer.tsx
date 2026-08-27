import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { FooterContent } from "@/lib/siteContent";
import { resolveIcon, ICON_REGISTRY } from "@/lib/icons/registry";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TikTokIcon,
  WhatsAppIcon,
  XIcon,
  YoutubeIcon
} from "@/components/icons/SocialIcons";

const MailIcon = ICON_REGISTRY.mail;
const SupportIcon = ICON_REGISTRY.wrench;

// Phone numbers stored in the CMS use a "00"-prefixed international format
// for display (see FooterEditor) — WhatsApp's wa.me links need bare digits
// (country code first, no "00"/"+"), same format as NEXT_PUBLIC_WHATSAPP_NUMBER.
function toWhatsAppDigits(phone: string) {
  return phone.replace(/^00/, "");
}

const SOCIAL_LINKS: { key: keyof FooterContent["social"]; Icon: typeof FacebookIcon }[] = [
  { key: "facebook", Icon: FacebookIcon },
  { key: "instagram", Icon: InstagramIcon },
  { key: "youtube", Icon: YoutubeIcon },
  { key: "linkedin", Icon: LinkedinIcon },
  { key: "tiktok", Icon: TikTokIcon },
  { key: "twitter", Icon: XIcon }
];

export default function Footer({
  dict,
  locale,
  content
}: {
  dict: Dictionary;
  locale: Locale;
  content: FooterContent;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-brand-700 text-brand-50">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <div className="mb-3 text-lg font-extrabold tracking-wide">SAKKAB</div>
          <p className="text-sm text-brand-100/70">{dict.hero.subtitle}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-brand-100/80">
            <MailIcon className="h-4 w-4 shrink-0" />
            <a href={`mailto:${content.email}`} className="hover:text-white">{content.email}</a>
          </div>
          <div className="mt-4 flex items-center gap-3">
            {SOCIAL_LINKS.filter(({ key }) => content.social[key]).map(({ key, Icon }) => (
              <a
                key={key}
                href={content.social[key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-brand-50 transition hover:bg-white/20 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
            <a
              href={buildWhatsAppLink(locale === "ar" ? "مرحباً، عندي استفسار" : "Hello, I have a question")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="whatsapp"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-brand-50 transition hover:bg-white/20 hover:text-white"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-200">
            {dict.footer.quick_links}
          </div>
          <ul className="space-y-2 text-sm text-brand-100/80">
            <li><Link href={`/${locale}/products`} className="hover:text-white">{dict.nav.products}</Link></li>
            <li><Link href={`/${locale}/about`} className="hover:text-white">{dict.nav.about}</Link></li>
            <li><Link href={`/${locale}/contact`} className="hover:text-white">{dict.nav.contact}</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-200">
            {dict.footer.locations_title}
          </div>
          <ul className="space-y-4 text-sm text-brand-100/80">
            {content.locations.map((loc) => {
              const PinIcon = resolveIcon(loc.icon, "map-pin");
              return (
                <li key={loc.phone}>
                  <div className="flex items-start gap-2">
                    <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">{loc.name[locale]}</div>
                      <div>{loc.address[locale]}</div>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" />
                    <a
                      href={buildWhatsAppLink(
                        locale === "ar" ? "مرحباً، عندي استفسار" : "Hello, I have a question",
                        toWhatsAppDigits(loc.phone)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="hover:text-white"
                    >
                      +{loc.phone}
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {content.techSupport.phone && (
        <div className="border-t border-white/10">
          <div className="container-page flex items-center gap-2 py-3 text-xs text-brand-100/70">
            <SupportIcon className="h-3.5 w-3.5 shrink-0" />
            <span>
              {dict.footer.tech_support}
              {content.techSupport.name ? ` — ${content.techSupport.name}` : ""}:
            </span>
            <a
              href={buildWhatsAppLink(
                locale === "ar" ? "مرحباً، عندي مشكلة تقنية بالموقع" : "Hello, I have a technical issue with the website",
                toWhatsAppDigits(content.techSupport.phone)
              )}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="font-medium hover:text-white"
            >
              +{content.techSupport.phone}
            </a>
          </div>
        </div>
      )}

      <div className="border-t border-white/10 py-4 text-center text-xs text-brand-100/60">
        © {year} SAKKAB DOORS GROUP — {dict.footer.rights}
      </div>
    </footer>
  );
}
