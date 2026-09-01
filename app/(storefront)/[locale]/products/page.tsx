import { permanentRedirect, notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";

// /products is now /catalog (the section-chooser landing) — kept as a
// permanent (308) redirect so old links/bookmarks still resolve, and so
// search engines transfer this URL's ranking signals to the new one
// instead of continuing to index the old path.
export default function ProductsRedirect({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  permanentRedirect(`/${params.locale}/catalog`);
}
