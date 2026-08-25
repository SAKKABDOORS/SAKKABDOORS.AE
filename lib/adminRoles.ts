// Pure constants/helpers only — no server-only imports (next/headers etc.)
// so this stays safe to import from client components like AdminSidebar.
// The session-checking guard (requirePageRole) lives in
// lib/requirePageRole.ts instead, which pulls in lib/auth.ts.

// SUPER_ADMIN: the owner account — full control, and the only role that can
// touch /admin/content (the homepage/site-content editor). Deliberately kept
// to a single account (enforced in the team-management UI/API, not here).
// MANAGER: everything SUPER_ADMIN has except /admin/content.
// EMPLOYEE: catalog only (products + categories) — no orders, no team, no
// site content, no AI knowledge base.
export const ADMIN_ROLES = ["SUPER_ADMIN", "MANAGER", "EMPLOYEE"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "مسؤول",
  MANAGER: "مدير",
  EMPLOYEE: "موظف"
};

export function isAdminRole(value: string): value is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(value);
}

// The page every role should land on right after login / when it hits a
// page it isn't allowed to see — an employee has no dashboard access, so
// sending them to "/admin" would just bounce them again.
export function homeForRole(role: AdminRole) {
  return role === "EMPLOYEE" ? "/admin/products" : "/admin";
}
