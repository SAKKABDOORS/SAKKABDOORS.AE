import { NextResponse } from "next/server";
import { getSystemSession } from "@/lib/systemAuth";
import type { SystemRoleValue } from "@/lib/systemRoles";

/**
 * Guard used at the top of every /api/system/* route handler. Returns a 401
 * response if there's no valid system session, or a 403 if `allowedRoles`
 * is given and the session's role isn't in it; otherwise returns the
 * session payload. Mirrors lib/adminApi.ts's requireAdmin().
 */
export async function requireSystemUser(allowedRoles?: SystemRoleValue[]) {
  const session = await getSystemSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  if (allowedRoles && !allowedRoles.includes(session.role as SystemRoleValue)) {
    return { session: null, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { session, response: null };
}
