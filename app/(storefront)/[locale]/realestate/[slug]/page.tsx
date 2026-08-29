import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import OrderForm from "@/components/OrderForm";
import ProductGallery from "@/components/ProductGallery";

export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const property = await prisma.property.findUnique({ where: { slug: params.slug }, include: { images: true } });
  if (!property) return {};

  const title = locale === "ar" ? property.titleAr : property.titleEn;
  const description = locale === "ar" ? property.descriptionAr : property.descriptionEn;
  const image = property.images[0]?.url;
  const path = `/realestate/${params.slug}`;

  return {
    title,
    description,
    alternates: { languages: { ar: `/ar${path}`, en: `/en${path}` } },
    openGraph: { title, description, images: image ? [image] : undefined }
  };
}

export default async function PropertyDetailPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  const property = await prisma.property.findUnique({
    where: { slug: params.slug },
    include: { images: true }
  });

  if (!property) notFound();

  const title = locale === "ar" ? property.titleAr : property.titleEn;
  const description = locale === "ar" ? property.descriptionAr : property.descriptionEn;
  const region = locale === "ar" ? property.regionAr : property.regionEn;
  const whatsappHref = buildWhatsAppLink(
    locale === "ar"
      ? `مرحباً، أرغب بالاستفسار عن: ${title}`
      : `Hello, I'd like to ask about: ${title}`
  );
  const inquiryMessage =
    locale === "ar" ? `استفسار عن العقار: ${title}` : `Inquiry about: ${title}`;

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={property.images.map((img) => ({ url: img.url, alt: img.alt || title }))}
          fallbackAlt={title}
        />

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">{region}</span>
          <h1 className="mt-1 text-3xl font-bold text-ink-900">{title}</h1>

          <div className="mt-4">
            <span className="text-2xl font-extrabold text-brand-700">{dict.realestate.ask_price}</span>
          </div>

          <dl className="mt-6 text-sm">
            <div>
              <dt className="text-ink-800/60">{dict.realestate.region}</dt>
              <dd className="font-medium text-ink-900">{region}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-ink-900">{dict.realestate.description}</h2>
            <p className="text-sm leading-relaxed text-ink-800/80">{description}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary">
              {dict.realestate.ask_whatsapp}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-xl">
        <OrderForm dict={dict} initialMessage={inquiryMessage} />
      </div>
    </div>
  );
}
