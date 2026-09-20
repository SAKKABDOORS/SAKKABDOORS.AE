import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  const vouchers = await prisma.employeeVoucher.findMany({
    where: { employeeId: params.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(vouchers);
}

const voucherSchema = z.object({ amount: z.number().positive(), reason: z.string().min(1).max(300) });

// Creates the EmployeeVoucher record AND a matching Payment(EXPENSE,
// category:"voucher") so it shows up in the ledger — see the schema
// comment on EmployeeVoucher for why these aren't FK-linked.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  const employee = await prisma.employee.findUnique({ where: { id: params.id } });
  if (!employee) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = voucherSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const voucher = await prisma.employeeVoucher.create({
    data: { employeeId: employee.id, amount: parsed.data.amount, reason: parsed.data.reason }
  });

  await prisma.payment.create({
    data: {
      type: "EXPENSE",
      category: "voucher",
      amount: parsed.data.amount,
      note: `سند قبض — ${employee.nameAr} — ${parsed.data.reason}`,
      employeeId: employee.id
    }
  });

  return NextResponse.json(voucher, { status: 201 });
}
