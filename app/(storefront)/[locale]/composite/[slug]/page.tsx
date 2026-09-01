import { permanentRedirect, notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";

// /composite/[slug] moved to /catalog/composite/[slug] — kept as a
// permanent (308) redirect so old links/bookmarks/search-engine indexing
// transfer to the new location.
export default function CompositeSlugRedirect({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  permanentRedirect(`/${params.locale}/catalog/composite/${params.slug}`);
}
