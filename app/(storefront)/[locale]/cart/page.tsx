import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import CartView from "@/components/cart/CartView";

// Personal, transient, and identical for every visitor regardless of what's
// actually in their cart — no reason for this to show up in search results.
export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  return {
    title: locale === "ar" ? "السلة" : "Cart",
    alternates: { languages: { ar: "/ar/cart", en: "/en/cart" } },
    robots: { index: false, follow: true }
  };
}

export default async function CartPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  return <CartView dict={dict} locale={locale} />;
}
