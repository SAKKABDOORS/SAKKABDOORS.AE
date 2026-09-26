import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./lib/i18n/config";

const SYSTEM_HOST_PREFIX = "system.";
const ADMIN_HOST_PREFIX = "admin.";
const ACCOUNTING_HOST_PREFIX = "account.";

// Handles five things:
// 1) system.sakkabdoors.ae serves ONLY the internal system app (quotes,
//    invoices, employees, etc. — app/(system-app)/system/...). Route groups
//    don't change the URL, so every path on this host is rewritten to carry
//    a /system prefix internally; api routes (app/api/system/...) pass
//    through untouched, same as /api elsewhere.
// 2) admin.sakkabdoors.ae serves ONLY the admin panel (app/(admin-app)/
//    admin/...) the same way — sakkabdoors.ae/admin was retired in favor
//    of this subdomain (see the 404 block below), matching how /system
//    never existed on the main domain either.
// 3) account.sakkabdoors.ae serves ONLY the formal accounting module
//    (app/(accounting-app)/accounting/...) the same way again — OWNER-only,
//    reuses the same SystemUser login as system.sakkabdoors.ae (see
//    lib/systemAuth.ts) but requires its own sign-in step per host.
// 4) Locale prefixing for the public site: "/" -> "/ar" (default) so every
//    public page lives under /ar/... or /en/....
// 5) Leaves /api untouched everywhere (locale-agnostic).
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

  if (hostname.startsWith(ADMIN_HOST_PREFIX)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/admin") ? pathname : `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  // /admin only ever exists behind the admin.* host above — block it on
  // the main domain so there's exactly one real URL for the admin panel.
  if (pathname.startsWith("/admin")) {
    return new NextResponse(null, { status: 404 });
  }

  if (hostname.startsWith(ACCOUNTING_HOST_PREFIX)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/accounting") ? pathname : `/accounting${pathname}`;
    return NextResponse.rewrite(url);
  }

  // /accounting only ever exists behind the account.* host above — block it
  // on the main domain so there's exactly one real URL for it.
  if (pathname.startsWith("/accounting")) {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname.startsWith("/api")) {
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
