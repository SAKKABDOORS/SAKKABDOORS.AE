import "server-only";
import { redirect } from "next/navigation";
import { getAdminSession } from "./auth";
import { homeForRole, isAdminRole, type AdminRole } from "./adminRoles";

// Server-component page guard: redirects to login if there's no session,
// or to that role's own home page if the role isn't in the allowed list.
// Mirrors requireAdmin() in lib/adminApi.ts, but for pages (redirect) rather
// than API routes (JSON 401/403).
export async function requirePageRole(allowedRoles: AdminRole[]) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  const role = isAdminRole(session.role) ? session.role : "EMPLOYEE";
  if (!allowedRoles.includes(role)) {
    redirect(homeForRole(role));
  }
  return { ...session, role };
}
