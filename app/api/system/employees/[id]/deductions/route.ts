import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  const deductions = await prisma.employeeDeduction.findMany({
    where: { employeeId: params.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(deductions);
}

const deductionSchema = z.object({ amount: z.number().positive(), reason: z.string().min(1).max(300) });

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  const employee = await prisma.employee.findUnique({ where: { id: params.id } });
  if (!employee) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = deductionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const deduction = await prisma.employeeDeduction.create({
    data: { employeeId: employee.id, amount: parsed.data.amount, reason: parsed.data.reason }
  });

  await logAudit(session!.email, "create", "EmployeeDeduction", deduction.id, `خصم ${parsed.data.amount.toFixed(2)} — ${employee.nameAr} — ${parsed.data.reason}`);
  return NextResponse.json(deduction, { status: 201 });
}
