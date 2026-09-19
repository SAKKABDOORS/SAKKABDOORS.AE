import "server-only";
import { redirect } from "next/navigation";
import { getSystemSession } from "./systemAuth";
import {
  homeForSystemRole,
  isSystemRole,
  DEFAULT_SYSTEM_ROLE_PAGES,
  type SystemPageKey,
  type SystemRoleValue
} from "./systemRoles";

// Server-component page guard: redirects to /login if there's no session,
// or home if this page isn't in that role's allowed set. OWNER always
// passes. No DB-configurable override yet (see lib/rolePermissions.ts for
// the pattern to copy once there are real MANAGER/STAFF users to tune) —
// MANAGER/STAFF are checked against the hardcoded DEFAULT_SYSTEM_ROLE_PAGES.
export async function requireSystemRole(page: SystemPageKey) {
  const session = await getSystemSession();
  if (!session) {
    redirect("/login");
  }
  const role: SystemRoleValue = isSystemRole(session.role) ? session.role : "STAFF";
  if (role !== "OWNER" && !DEFAULT_SYSTEM_ROLE_PAGES[role].includes(page)) {
    redirect(homeForSystemRole(role));
  }
  return { ...session, role };
}
