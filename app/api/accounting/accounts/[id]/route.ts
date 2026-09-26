import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

const updateSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().max(200).nullable().optional(),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"]).optional(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().optional()
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.account.findUnique({ where: { id: params.id }, include: { _count: { select: { lines: true } } } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // A ledger line already carries a fixed debit-normal/credit-normal
  // meaning derived from the account's type (lib/accounts.ts's
  // normalBalanceFor) — changing type after lines exist would silently
  // flip the sign of every past report, so it's locked instead.
  if (parsed.data.type && parsed.data.type !== existing.type && existing._count.lines > 0) {
    return NextResponse.json({ error: "type_locked" }, { status: 409 });
  }

  if (parsed.data.code && parsed.data.code !== existing.code) {
    const codeTaken = await prisma.account.findUnique({ where: { code: parsed.data.code } });
    if (codeTaken) {
      return NextResponse.json({ error: "code_taken" }, { status: 409 });
    }
  }

  const { parentId, ...rest } = parsed.data;
  const account = await prisma.account.update({
    where: { id: params.id },
    data: { ...rest, ...(parentId !== undefined ? { parentId: parentId || null } : {}) }
  });

  await logAudit(session!.email, "update", "Account", account.id, `تعديل حساب: ${account.code} — ${account.nameAr}`);
  return NextResponse.json(account);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const existing = await prisma.account.findUnique({ where: { id: params.id }, include: { _count: { select: { lines: true, children: true } } } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (existing._count.lines > 0) {
    return NextResponse.json({ error: "has_lines" }, { status: 409 });
  }
  if (existing._count.children > 0) {
    return NextResponse.json({ error: "has_children" }, { status: 409 });
  }

  await prisma.account.delete({ where: { id: params.id } });
  await logAudit(session!.email, "delete", "Account", existing.id, `حذف حساب: ${existing.code} — ${existing.nameAr}`);
  return NextResponse.json({ ok: true });
}
