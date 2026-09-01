import { permanentRedirect, notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";

// /composite moved to /catalog/composite — kept as a permanent (308)
// redirect so old links/bookmarks/search-engine indexing transfer to the
// new location.
export default function CompositeRedirect({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  permanentRedirect(`/${params.locale}/catalog/composite`);
}
