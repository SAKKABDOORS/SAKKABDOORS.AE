import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

// OWNER is deliberately not an assignable option here — it's DARKSHAM's own
// account (created once via /api/system/bootstrap), not invited from this
// form. Mirrors app/api/admin/users/route.ts.
const createSchema = z.object({
  email: z.string().trim().min(1).max(200),
  password: z.string().min(8, "٨ أحرف على الأقل"),
  name: z.string().trim().min(1),
  role: z.enum(["MANAGER", "STAFF"]),
  employeeId: z.string().min(1).optional()
});

// Only OWNER can see/manage accounts — see lib/systemRoles.ts's
// DEFAULT_SYSTEM_ROLE_PAGES (MANAGER/STAFF don't get the "users" page key).
export async function GET() {
  const { response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const users = await prisma.systemUser.findMany({
    select: { id: true, email: true, name: true, role: true, employeeId: true, createdAt: true },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const normalizedEmail = parsed.data.email.toLowerCase();
  const existing = await prisma.systemUser.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  // "One login per employee" — enforced here since employeeId isn't a
  // @unique FK (see the schema comment on SystemUser for why).
  if (parsed.data.employeeId) {
    const alreadyLinked = await prisma.systemUser.findFirst({ where: { employeeId: parsed.data.employeeId } });
    if (alreadyLinked) {
      return NextResponse.json({ error: "employee_already_linked" }, { status: 409 });
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.systemUser.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: parsed.data.name,
      role: parsed.data.role,
      employeeId: parsed.data.employeeId || null
    },
    select: { id: true, email: true, name: true, role: true, employeeId: true, createdAt: true }
  });

  await logAudit(session!.email, "create", "SystemUser", user.id, `إضافة مستخدم للنظام: ${user.email} (${user.role})`);
  return NextResponse.json(user, { status: 201 });
}
