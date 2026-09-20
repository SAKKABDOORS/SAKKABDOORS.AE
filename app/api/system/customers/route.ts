import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

export async function GET() {
  const { response } = await requireSystemUser();
  if (response) return response;

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { customerType: true }
  });
  return NextResponse.json(customers);
}

const customerSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().max(200).optional(),
  phone: z.string().min(1),
  email: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  customerTypeId: z.string().optional()
});

export async function POST(request: NextRequest) {
  const { session, response } = await requireSystemUser();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = customerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { customerTypeId, ...rest } = parsed.data;
  const customer = await prisma.customer.create({
    data: { ...rest, customerTypeId: customerTypeId || undefined }
  });
  await logAudit(session!.email, "create", "Customer", customer.id, `إضافة عميل: ${customer.nameAr}`);
  return NextResponse.json(customer, { status: 201 });
}
