import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

const passwordSchema = z.object({ password: z.string().min(8, "٨ أحرف على الأقل") });

// Remove another account. Blocked for: deleting yourself, and deleting the
// last remaining OWNER (would lock DARKSHAM out permanently). Mirrors
// app/api/admin/users/[id]/route.ts.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  if (params.id === session!.sub) {
    return NextResponse.json({ error: "cannot_delete_self" }, { status: 400 });
  }

  const target = await prisma.systemUser.findUnique({ where: { id: params.id }, select: { role: true } });
  if (target?.role === "OWNER") {
    const ownerCount = await prisma.systemUser.count({ where: { role: "OWNER" } });
    if (ownerCount <= 1) {
      return NextResponse.json({ error: "last_owner" }, { status: 400 });
    }
  }

  await prisma.systemUser.delete({ where: { id: params.id } }).catch(() => null);
  await logAudit(session!.email, "delete", "SystemUser", params.id, `حذف مستخدم من النظام`);
  return NextResponse.json({ ok: true });
}

// Change a password. id="me" changes your own (any role); a real id resets
// a teammate's and is OWNER-only.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const isSelf = params.id === "me";
  const { session, response } = await requireSystemUser(isSelf ? undefined : ["OWNER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = passwordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const targetId = isSelf ? session!.sub : params.id;
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.systemUser.update({ where: { id: targetId }, data: { passwordHash } }).catch(() => null);
  await logAudit(session!.email, "update", "SystemUser", targetId, isSelf ? "تغيير كلمة المرور الخاصة" : "إعادة تعيين كلمة مرور مستخدم");
  return NextResponse.json({ ok: true });
}
