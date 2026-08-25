import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, localeDirection, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSiteSetting } from "@/lib/siteContent";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatWidget from "@/components/AIChatWidget";
import PageTransition from "@/components/motion/PageTransition";
import CartProvider from "@/components/cart/CartProvider";
import { anton, cairo, inter } from "@/lib/fonts";
import "../../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = await getDictionary(locale);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Sakkab Doors";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sakkabdoors.ae";
  const ogLocale = locale === "ar" ? "ar_AE" : "en_AE";
  const altOgLocale = locale === "ar" ? "en_AE" : "ar_AE";

  return {
    metadataBase: new URL(siteUrl),
    // Individual pages set just their own short title (e.g. "الكتالوج") and
    // this template appends the site name automatically — see products/page.tsx
    // etc. for the pattern.
    title: { default: `${siteName} | ${dict.hero.title}`, template: `%s | ${siteName}` },
    description: dict.hero.subtitle,
    alternates: {
      languages: { ar: "/ar", en: "/en" }
    },
    openGraph: {
      type: "website",
      siteName,
      title: dict.hero.title,
      description: dict.hero.subtitle,
      locale: ogLocale,
      alternateLocale: altOgLocale,
      url: `/${locale}`
    },
    twitter: {
      card: "summary_large_image",
      title: dict.hero.title,
      description: dict.hero.subtitle
    }
  };
}

export default async function StorefrontLocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const dir = localeDirection[locale];
  const [footerContent, brandingContent] = await Promise.all([
    getSiteSetting("footer"),
    getSiteSetting("branding")
  ]);

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${cairo.variable} ${anton.variable}`}>
      <body>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header dict={dict} locale={locale} logoUrl={brandingContent.logoUrl} />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer dict={dict} locale={locale} content={footerContent} />
            <WhatsAppButton label={dict.nav.whatsapp} />
            <AIChatWidget dict={dict} locale={locale} />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
