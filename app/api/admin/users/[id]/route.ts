import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

const passwordSchema = z.object({ password: z.string().min(8, "٨ أحرف على الأقل") });

// Remove another admin's account. Deliberately blocked for three cases:
// deleting yourself (use the password-change flow below instead, or ask a
// teammate), deleting the last remaining admin (would lock everyone out of
// the dashboard permanently), and deleting the SUPER_ADMIN (the single owner
// account — a MANAGER could otherwise lock the owner out).
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  if (params.id === session!.sub) {
    return NextResponse.json({ error: "cannot_delete_self" }, { status: 400 });
  }

  const target = await prisma.admin.findUnique({ where: { id: params.id }, select: { role: true } });
  if (target?.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "cannot_delete_super_admin" }, { status: 400 });
  }

  const total = await prisma.admin.count();
  if (total <= 1) {
    return NextResponse.json({ error: "last_admin" }, { status: 400 });
  }

  await prisma.admin.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

// Change a password. Pass id="me" to change your own (any logged-in role —
// used by the "change my password" card); a real admin id resets a
// teammate's password instead and is restricted to SUPER_ADMIN/MANAGER (no
// old password required since you're already authenticated as an admin).
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const isSelf = params.id === "me";
  const { session, response } = await requireAdmin(isSelf ? undefined : ["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = passwordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const targetId = isSelf ? session!.sub : params.id;
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.admin.update({ where: { id: targetId }, data: { passwordHash } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
