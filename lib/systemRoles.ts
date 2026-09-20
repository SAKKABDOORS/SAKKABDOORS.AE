// Pure constants/helpers only — no server-only imports (next/headers etc.)
// so this stays safe to import from client components like SystemSidebar.
// Mirrors lib/adminRoles.ts's shape exactly, but for the fully separate
// system.sakkabdoors.ae login (SystemUser/SystemRole, not Admin/AdminRole).

// OWNER: DARKSHAM's account — full control, the only role that can manage
// /system/users. MANAGER: everything except /system/users. STAFF: read/use
// the day-to-day modules (quotes, invoices, customers) — no payroll/HR data.
export const SYSTEM_ROLES = ["OWNER", "MANAGER", "STAFF"] as const;
export type SystemRoleValue = (typeof SYSTEM_ROLES)[number];

export const SYSTEM_ROLE_LABELS: Record<SystemRoleValue, string> = {
  OWNER: "مالك",
  MANAGER: "مدير",
  STAFF: "موظف"
};

export function isSystemRole(value: string): value is SystemRoleValue {
  return (SYSTEM_ROLES as readonly string[]).includes(value);
}

// Every module/page in the internal system that can be shown or hidden per
// role. OWNER always sees all of them, unconditionally.
export const SYSTEM_PAGE_KEYS = [
  "dashboard",
  "quotes",
  "invoices",
  "payments",
  "customers",
  "customerTypes",
  "employees",
  "wages",
  "vouchers",
  "deductions",
  "evaluations",
  "warehouse",
  "users",
  "auditLog"
] as const;
export type SystemPageKey = (typeof SYSTEM_PAGE_KEYS)[number];

export function isSystemPageKey(value: string): value is SystemPageKey {
  return (SYSTEM_PAGE_KEYS as readonly string[]).includes(value);
}

export const SYSTEM_PAGE_KEY_LABELS: Record<SystemPageKey, string> = {
  dashboard: "لوحة التحكم",
  quotes: "عروض الأسعار",
  invoices: "الفواتير",
  payments: "المدفوعات",
  customers: "العملاء",
  customerTypes: "أنواع العملاء",
  employees: "الموظفين",
  wages: "أجور الموظفين",
  vouchers: "سندات القبض",
  deductions: "الخصومات",
  evaluations: "تقييم الموظفين",
  warehouse: "المخزن",
  users: "المستخدمين",
  auditLog: "سجل التدقيق"
};

// Default visibility until an OWNER configures it otherwise (no
// /system/permissions UI in phase 1 — everything below OWNER defaults to
// the day-to-day modules; HR/payroll pages stay OWNER-only until that
// screen exists).
export const DEFAULT_SYSTEM_ROLE_PAGES: Record<Exclude<SystemRoleValue, "OWNER">, SystemPageKey[]> = {
  MANAGER: [
    "dashboard",
    "quotes",
    "invoices",
    "payments",
    "customers",
    "customerTypes",
    "employees",
    "wages",
    "vouchers",
    "deductions",
    "evaluations",
    "warehouse"
  ],
  STAFF: ["dashboard", "quotes", "invoices", "customers", "customerTypes"]
};

export function homeForSystemRole(_role: SystemRoleValue) {
  return "/";
}
