import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";

const updateSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().max(200).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().max(200).optional(),
  position: z.string().max(200).optional(),
  monthlyWage: z.number().nonnegative().optional(),
  hireDate: z.string().nullable().optional(),
  isActive: z.boolean().optional()
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { hireDate, ...rest } = parsed.data;
  const employee = await prisma.employee.update({
    where: { id: params.id },
    data: { ...rest, ...(hireDate !== undefined ? { hireDate: hireDate ? new Date(hireDate) : null } : {}) }
  });
  return NextResponse.json(employee);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  // Payment.employeeId is onDelete: SetNull — past wage/voucher/deduction
  // payment records survive, just detached from the deleted employee.
  await prisma.employee.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
