import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./lib/i18n/config";

// Handles two things:
// 1) Locale prefixing for the public site: "/" -> "/ar" (default) so every
//    public page lives under /ar/... or /en/....
// 2) Leaves /admin and /api untouched (they're locale-agnostic; the admin
//    UI itself is bilingual-ready but not locale-routed for simplicity).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
