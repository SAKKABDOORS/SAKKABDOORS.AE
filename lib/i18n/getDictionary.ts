import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default)
};

export async function getDictionary(locale: Locale) {
  const loader = dictionaries[locale] ?? dictionaries.ar;
  return loader();
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
