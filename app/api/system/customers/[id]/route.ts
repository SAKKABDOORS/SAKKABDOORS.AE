import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";

const updateSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().max(200).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  customerTypeId: z.string().nullable().optional()
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { customerTypeId, ...rest } = parsed.data;
  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: { ...rest, customerTypeId: customerTypeId === "" ? null : customerTypeId }
  });
  return NextResponse.json(customer);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  // Quote.customerId is onDelete: SetNull — a quote already tied to this
  // customer keeps its own snapshotted customerName/etc regardless.
  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
