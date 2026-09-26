import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSystemSession } from "@/lib/systemAuth";
import { isSystemRole } from "@/lib/systemRoles";

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1)
});

// Same SystemUser login as system.sakkabdoors.ae (app/api/system/login),
// but this one refuses to issue a session at all for a non-OWNER — the
// accounting module is OWNER-only (see lib/systemRoles.ts), and this app
// has no other page to redirect a rejected role to.
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const user = await prisma.systemUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() }
  });

  if (!user) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const role = isSystemRole(user.role) ? user.role : "STAFF";
  if (role !== "OWNER") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await createSystemSession(user.id, user.email, role);
  return NextResponse.json({ ok: true, redirectTo: "/" });
}
