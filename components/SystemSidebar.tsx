"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Users, Layers, FileText, Receipt, Wallet, type LucideIcon } from "lucide-react";
import { homeForSystemRole, type SystemRoleValue, type SystemPageKey } from "@/lib/systemRoles";

// Mirrors components/AdminSidebar.tsx exactly, for the fully separate
// system.sakkabdoors.ae app. NAV only lists modules that actually have a
// page built yet — extended as each phase in the plan ships its route.
const NAV: { href: string; label: string; icon: LucideIcon; key: SystemPageKey }[] = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard, key: "dashboard" },
  { href: "/quotes", label: "عروض الأسعار", icon: FileText, key: "quotes" },
  { href: "/invoices", label: "الفواتير", icon: Receipt, key: "invoices" },
  { href: "/payments", label: "المدفوعات", icon: Wallet, key: "payments" },
  { href: "/customers", label: "العملاء", icon: Users, key: "customers" },
  { href: "/customer-types", label: "أنواع العملاء", icon: Layers, key: "customerTypes" }
];

export default function SystemSidebar({
  role,
  allowedPages
}: {
  role: SystemRoleValue;
  allowedPages: SystemPageKey[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleNav = NAV.filter((item) => allowedPages.includes(item.key));
  const homeHref = homeForSystemRole(role);

  async function handleLogout() {
    await fetch("/api/system/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-60 flex-col border-e border-brand-100 bg-white p-4">
      <Link href={homeHref} className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-700">
          <img src="/images/logo-mark.png" alt="" className="h-full w-full object-cover" />
        </span>
        <span className="text-base font-bold text-brand-700">Sakkab — النظام</span>
      </Link>
      <nav className="flex-1 space-y-1">
        {visibleNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active ? "bg-brand-600 text-white" : "text-ink-800 hover:bg-brand-50"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-brand-200 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
      >
        <LogOut className="h-4 w-4" strokeWidth={2} />
        تسجيل الخروج
      </button>
    </aside>
  );
}
