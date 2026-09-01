import { permanentRedirect, notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";

// /aluminum/[slug] moved to /catalog/aluminum/[slug] — kept as a permanent
// (308) redirect so old links/bookmarks/search-engine indexing transfer to
// the new location.
export default function AluminumSlugRedirect({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  permanentRedirect(`/${params.locale}/catalog/aluminum/${params.slug}`);
}
