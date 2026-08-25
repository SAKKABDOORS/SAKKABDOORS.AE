import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { PropertyWithRelations } from "@/lib/types";
import { formatDaysAgo } from "@/lib/formatRelativeDate";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function PropertyCard({
  property,
  locale,
  dict
}: {
  property: PropertyWithRelations;
  locale: Locale;
  dict: Dictionary;
}) {
  const title = locale === "ar" ? property.titleAr : property.titleEn;
  const region = locale === "ar" ? property.regionAr : property.regionEn;
  const image = property.images[0]?.url ?? "/images/placeholder-door.svg";
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const whatsappHref = buildWhatsAppLink(
    locale === "ar" ? `مرحباً، عندي استفسار عن ${title}` : `Hello, I have a question about ${title}`
  );

  return (
    <div className="card-interactive group flex flex-col overflow-hidden">
      <Link href={`/${locale}/realestate/${property.slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-brand-100">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute start-3 top-3 rounded-full bg-ink-900/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {formatDaysAgo(property.createdAt, locale)}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link href={`/${locale}/realestate/${property.slug}`}>
          <span className="text-xs font-medium uppercase tracking-wide text-brand-500">{region}</span>
          <h3 className="font-semibold text-ink-900">{title}</h3>
        </Link>
        <span className="pt-3 text-lg font-bold text-brand-700">
          {property.price.toLocaleString(locale === "ar" ? "ar-AE" : "en-AE")} {property.currency}
        </span>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={`tel:+${phone}`}
            dir="ltr"
            className="btn-secondary justify-center py-2 text-xs"
          >
            <Phone className="h-3.5 w-3.5" />
            {dict.realestate.call}
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pill-solid justify-center py-2 text-xs"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {dict.nav.whatsapp}
          </a>
        </div>
      </div>
    </div>
  );
}
