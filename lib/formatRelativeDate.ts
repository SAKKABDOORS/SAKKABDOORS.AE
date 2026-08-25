import type { Locale } from "./i18n/config";

// Arabic day counts follow their own grammatical number agreement (dual and
// plural forms differ from a simple "N + يوم" concatenation), so this can't
// reuse a generic Intl.RelativeTimeFormat-style template the way English can.
function arabicDaysAgo(days: number): string {
  if (days <= 0) return "اليوم";
  if (days === 1) return "منذ يوم واحد";
  if (days === 2) return "منذ يومين";
  if (days <= 10) return `منذ ${days} أيام`;
  return `منذ ${days} يوماً`;
}

function englishDaysAgo(days: number): string {
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function formatDaysAgo(date: Date, locale: Locale): string {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  return locale === "ar" ? arabicDaysAgo(days) : englishDaysAgo(days);
}
