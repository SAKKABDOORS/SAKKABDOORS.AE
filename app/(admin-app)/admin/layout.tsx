import type { Metadata } from "next";
import { cairo } from "@/lib/fonts";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Sakkab Doors — Admin",
  robots: { index: false, follow: false }
};

// Root layout for the whole /admin section. Kept Arabic/RTL by default
// since this is an internal tool, not the bilingual public storefront.
// The actual auth gate + sidebar chrome lives in the nested
// (protected)/layout.tsx so /admin/login can render without it.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="bg-sage-50">{children}</body>
    </html>
  );
}
