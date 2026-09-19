import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./lib/i18n/config";

const SYSTEM_HOST_PREFIX = "system.";

// Handles three things:
// 1) system.sakkabdoors.ae serves ONLY the internal system app (quotes,
//    invoices, employees, etc. — app/(system-app)/system/...). Route groups
//    don't change the URL, so every path on this host is rewritten to carry
//    a /system prefix internally; api routes (app/api/system/...) pass
//    through untouched, same as /api elsewhere.
// 2) Locale prefixing for the public site: "/" -> "/ar" (default) so every
//    public page lives under /ar/... or /en/....
// 3) Leaves /admin and /api untouched (they're locale-agnostic; the admin
//    UI itself is bilingual-ready but not locale-routed for simplicity).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  if (pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname.includes(".")) {
    return NextResponse.next();
  }

  if (hostname.startsWith(SYSTEM_HOST_PREFIX)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/system") ? pathname : `/system${pathname}`;
    return NextResponse.rewrite(url);
  }

  // /system only ever exists behind the system.* host above — block it on
  // the main domain so there's exactly one real URL for the system app.
  if (pathname.startsWith("/system")) {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
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
