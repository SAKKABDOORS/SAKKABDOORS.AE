"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Briefcase,
  Building2,
  ClipboardList,
  DoorOpen,
  LayoutDashboard,
  Layers,
  LogOut,
  Palette,
  Users,
  type LucideIcon
} from "lucide-react";
import { homeForRole, type AdminRole } from "@/lib/adminRoles";

const NAV: { href: string; label: string; icon: LucideIcon; roles: AdminRole[] }[] = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "MANAGER"] },
  { href: "/admin/products", label: "المنتجات", icon: DoorOpen, roles: ["SUPER_ADMIN", "MANAGER", "EMPLOYEE"] },
  { href: "/admin/categories", label: "الفئات", icon: Layers, roles: ["SUPER_ADMIN", "MANAGER", "EMPLOYEE"] },
  { href: "/admin/properties", label: "العقارات", icon: Building2, roles: ["SUPER_ADMIN", "MANAGER"] },
  { href: "/admin/jobs", label: "الوظائف الشاغرة", icon: Briefcase, roles: ["SUPER_ADMIN", "MANAGER"] },
  { href: "/admin/orders", label: "الطلبات", icon: ClipboardList, roles: ["SUPER_ADMIN", "MANAGER"] },
  { href: "/admin/content", label: "محتوى الموقع", icon: Palette, roles: ["SUPER_ADMIN"] },
  { href: "/admin/ai", label: "الذكاء الاصطناعي", icon: Bot, roles: ["SUPER_ADMIN", "MANAGER"] },
  { href: "/admin/team", label: "حسابات الإدارة", icon: Users, roles: ["SUPER_ADMIN", "MANAGER"] }
];

export default function AdminSidebar({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleNav = NAV.filter((item) => item.roles.includes(role));
  const homeHref = homeForRole(role);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-60 flex-col border-e border-brand-100 bg-white p-4">
      <Link href={homeHref} className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-700">
          <img src="/images/logo-mark.png" alt="" className="h-full w-full object-cover" />
        </span>
        <span className="text-base font-bold text-brand-700">Sakkab Doors</span>
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
