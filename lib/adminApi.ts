import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import type { AdminRole } from "@/lib/adminRoles";

/**
 * Guard used at the top of every /api/admin/* and /api/products (mutating)
 * route handlers. Returns a 401 response if there's no valid admin
 * session, or a 403 if `allowedRoles` is given and the session's role isn't
 * in it; otherwise returns the session payload.
 */
export async function requireAdmin(allowedRoles?: AdminRole[]) {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  if (allowedRoles && !allowedRoles.includes(session.role as AdminRole)) {
    return { session: null, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { session, response: null };
}
