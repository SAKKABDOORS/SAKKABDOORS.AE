import "server-only";
import { redirect } from "next/navigation";
import { getSystemSession } from "./systemAuth";
import { isSystemRole, type SystemRoleValue } from "./systemRoles";

// Server-component page guard for account.sakkabdoors.ae — OWNER-only, no
// other page to fall back to in this single-purpose app, so any failure
// (no session, or a role downgraded mid-session) redirects straight to
// /login rather than a "home for this role" page like requireSystemRole
// does. The login itself (app/api/accounting/login/route.ts) already
// refuses to issue a session for a non-OWNER — this is defense-in-depth.
export async function requireAccountingRole() {
  const session = await getSystemSession();
  if (!session) {
    redirect("/login");
  }
  const role: SystemRoleValue = isSystemRole(session.role) ? session.role : "STAFF";
  if (role !== "OWNER") {
    redirect("/login");
  }
  return { ...session, role };
}
