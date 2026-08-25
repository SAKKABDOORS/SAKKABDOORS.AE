import { Mail, MapPin } from "lucide-react";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import OrderForm from "@/components/OrderForm";
import Reveal from "@/components/motion/Reveal";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default async function ContactPage({
  params
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const whatsappHref = buildWhatsAppLink(
    locale === "ar" ? "مرحباً، لدي استفسار عام." : "Hello, I have a general inquiry."
  );

  return (
    <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:items-start">
      <Reveal>
        <span className="eyebrow">{dict.contact.eyebrow}</span>
        <h1 className="font-display mb-6 mt-2 text-3xl text-ink-900 sm:text-5xl">{dict.contact.title}</h1>

        <div className="card space-y-4 p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-800/50">
                {locale === "en" ? "Address" : "العنوان"}
              </div>
              <div className="mt-0.5 text-sm font-medium text-ink-900">{dict.contact.address}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-800/50">{dict.contact.email}</div>
              <div className="mt-0.5 text-sm font-medium text-ink-900" dir="ltr">FAX@SAKKABDOORS.AE</div>
            </div>
          </div>
        </div>

        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-6">
          {dict.nav.whatsapp}
        </a>
      </Reveal>

      <Reveal delay={0.1}>
        <OrderForm dict={dict} />
      </Reveal>
    </div>
  );
}
