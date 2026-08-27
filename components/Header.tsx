"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import LanguageSwitcher from "./LanguageSwitcher";
import CartNavLink from "./cart/CartNavLink";

export default function Header({
  dict,
  locale,
  logoUrl
}: {
  dict: Dictionary;
  locale: Locale;
  logoUrl: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu automatically on route change, so a nav tap
  // doesn't leave a stale open menu covering the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/products`, label: dict.nav.products },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/careers`, label: dict.nav.careers }
  ];

  const isActive = (href: string) => (href === `/${locale}` ? pathname === href : pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-40 bg-brand-900">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2 font-extrabold tracking-wide text-white">
          {/* Admin-configurable (arbitrary upload/external URL), so this
              stays a plain <img> rather than next/image — the latter
              requires every remote hostname to be allow-listed ahead of
              time in next.config.mjs. */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/20">
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          </span>
          <span className="text-lg">SAKKAB</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link, i) => (
            <Fragment key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`border-b-2 px-3 py-2 text-sm font-bold transition ${
                  isActive(link.href)
                    ? "border-white text-white"
                    : "border-transparent text-white/75 hover:border-white/40 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
              {i === 1 && <CartNavLink locale={locale} label={dict.nav.cart} />}
            </Fragment>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher locale={locale} />
          <Link href={`/${locale}/contact`} className="btn-primary hidden sm:inline-flex">
            {dict.nav.contact_us_btn}
          </Link>

          {/* Mobile menu toggle — replaces the old horizontally-scrolling
              nav strip with a proper dropdown, which reads as far more
              deliberate/professional on phones. */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? (locale === "ar" ? "إغلاق القائمة" : "Close menu") : locale === "ar" ? "فتح القائمة" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10 md:hidden"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${
                  open ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav — animated dropdown instead of the previous scrollable strip.
          max-height (not grid-template-rows fr-units, which older Android
          WebViews — e.g. in-app browsers opened from WhatsApp/Instagram —
          can fail to animate) so the menu reliably opens everywhere. */}
      <nav
        className={`overflow-hidden border-t border-white/10 bg-brand-800 transition-[max-height] duration-300 md:hidden ${
          open ? "max-h-screen" : "max-h-0 border-t-0"
        }`}
      >
        <div className="container-page space-y-1 py-3">
          {links.map((link, i) => (
            <Fragment key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive(link.href)
                    ? "bg-white/10 text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
              {i === 1 && (
                <div className="px-3 py-1">
                  <CartNavLink locale={locale} label={dict.nav.cart} />
                </div>
              )}
            </Fragment>
          ))}
          <Link href={`/${locale}/contact`} className="btn-primary mt-2 w-full sm:hidden">
            {dict.nav.contact_us_btn}
          </Link>
        </div>
      </nav>
    </header>
  );
}
