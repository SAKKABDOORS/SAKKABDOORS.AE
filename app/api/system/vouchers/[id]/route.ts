import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  // The matching ledger Payment (same employeeId/category/amount, no FK
  // link — see the schema comment on EmployeeVoucher) is left as-is; it's
  // a historical money movement independent of this HR record.
  await prisma.employeeVoucher.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
