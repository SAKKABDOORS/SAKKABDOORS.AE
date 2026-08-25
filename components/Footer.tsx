import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { FooterContent } from "@/lib/siteContent";
import { resolveIcon, ICON_REGISTRY } from "@/lib/icons/registry";

const MailIcon = ICON_REGISTRY.mail;
const PhoneIcon = ICON_REGISTRY.phone;

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
                    <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
                    <a href={`tel:+${loc.phone}`} dir="ltr" className="hover:text-white">
                      +{loc.phone}
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-brand-100/60">
        © {year} SAKKAB DOORS GROUP — {dict.footer.rights}
      </div>
    </footer>
  );
}
