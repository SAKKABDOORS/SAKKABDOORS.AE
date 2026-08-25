import "server-only";
import { redirect } from "next/navigation";
import { getAdminSession } from "./auth";
import { homeForRole, isAdminRole, type PageKey } from "./adminRoles";
import { isPageAllowed } from "./rolePermissions";

// Server-component page guard: redirects to login if there's no session, or
// to that role's own home page if this page isn't in its allowed set.
// SUPER_ADMIN always passes. MANAGER/EMPLOYEE are checked against the
// SUPER_ADMIN-configurable permissions in lib/rolePermissions.ts (falling
// back to sane defaults until explicitly configured).
// Mirrors requireAdmin() in lib/adminApi.ts, but for pages (redirect) rather
// than API routes (JSON 401/403).
export async function requirePageRole(page: PageKey) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  const role = isAdminRole(session.role) ? session.role : "EMPLOYEE";
  if (!(await isPageAllowed(role, page))) {
    redirect(homeForRole(role));
  }
  return { ...session, role };
}
