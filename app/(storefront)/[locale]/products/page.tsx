import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";

// /products is now /catalog (the section-chooser landing) — kept as a
// redirect so old links/bookmarks still resolve instead of 404ing.
export default function ProductsRedirect({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  redirect(`/${params.locale}/catalog`);
}
