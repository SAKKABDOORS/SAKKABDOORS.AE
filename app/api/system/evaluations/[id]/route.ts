import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  const evaluation = await prisma.employeeEvaluation.delete({ where: { id: params.id } });
  await logAudit(session!.email, "delete", "EmployeeEvaluation", evaluation.id, `حذف تقييم موظف`);
  return NextResponse.json({ ok: true });
}
