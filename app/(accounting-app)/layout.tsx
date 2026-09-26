import type { Metadata } from "next";
import { cairo } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Sakkab Doors — المحاسبة",
  robots: { index: false, follow: false }
};

// Root layout for the whole account.sakkabdoors.ae app (rewritten to
// /accounting by middleware.ts). Kept Arabic/RTL by default, same as
// /system and /admin — the auth gate + sidebar chrome lives in the nested
// (protected)/layout.tsx so /accounting/login can render without it.
export default function AccountingRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="bg-sage-50">{children}</body>
    </html>
  );
}
