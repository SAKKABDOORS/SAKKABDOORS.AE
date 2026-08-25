import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

const updateSchema = z.object({
  category: z.enum(["general", "faq", "policy", "product"]).optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(4000).optional(),
  isActive: z.boolean().optional()
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await prisma.knowledgeEntry.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(entry);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  await prisma.knowledgeEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
