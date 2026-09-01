import { permanentRedirect, notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";

// /wpc/[slug] moved to /catalog/wpc/[slug] — kept as a permanent (308)
// redirect so old links/bookmarks/search-engine indexing transfer to the
// new location.
export default function WpcSlugRedirect({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  permanentRedirect(`/${params.locale}/catalog/wpc/${params.slug}`);
}
