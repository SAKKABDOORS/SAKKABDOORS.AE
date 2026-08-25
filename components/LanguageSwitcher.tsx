"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

const LABELS: Record<Locale, string> = { ar: "EN", en: "عربي" };
const TARGET: Record<Locale, Locale> = { ar: "en", en: "ar" };

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const target = TARGET[locale];

  // Swap the leading /ar or /en segment for the other locale, keep the rest.
  const rest = pathname?.replace(/^\/(ar|en)/, "") || "";
  const href = `/${target}${rest}`;

  return (
    <Link
      href={href}
      className="rounded-lg border border-white/25 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/10"
    >
      {LABELS[locale]}
    </Link>
  );
}
