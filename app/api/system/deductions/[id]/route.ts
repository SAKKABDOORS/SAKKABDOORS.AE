import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  const deduction = await prisma.employeeDeduction.delete({ where: { id: params.id } });
  await logAudit(session!.email, "delete", "EmployeeDeduction", deduction.id, `حذف خصم ${deduction.amount.toFixed(2)} — ${deduction.reason}`);
  return NextResponse.json({ ok: true });
}
