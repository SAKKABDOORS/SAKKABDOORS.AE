import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  // The matching ledger Payment (same employeeId/category/amount, no FK
  // link — see the schema comment on EmployeeVoucher) is left as-is; it's
  // a historical money movement independent of this HR record.
  const voucher = await prisma.employeeVoucher.delete({ where: { id: params.id } });
  await logAudit(session!.email, "delete", "EmployeeVoucher", voucher.id, `حذف سند قبض ${voucher.amount.toFixed(2)} — ${voucher.reason}`);
  return NextResponse.json({ ok: true });
}
