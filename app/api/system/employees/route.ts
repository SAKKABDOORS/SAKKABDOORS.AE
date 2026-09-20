import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

export async function GET() {
  const { response } = await requireSystemUser();
  if (response) return response;

  const employees = await prisma.employee.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(employees);
}

const employeeSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().max(200).optional(),
  phone: z.string().min(1),
  email: z.string().max(200).optional(),
  position: z.string().max(200).optional(),
  monthlyWage: z.number().nonnegative().default(0),
  hireDate: z.string().optional(),
  isActive: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = employeeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { hireDate, ...rest } = parsed.data;
  const employee = await prisma.employee.create({
    data: { ...rest, hireDate: hireDate ? new Date(hireDate) : null }
  });
  await logAudit(session!.email, "create", "Employee", employee.id, `إضافة موظف: ${employee.nameAr}`);
  return NextResponse.json(employee, { status: 201 });
}
