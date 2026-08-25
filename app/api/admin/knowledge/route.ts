import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const entries = await prisma.knowledgeEntry.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(entries);
}

const knowledgeSchema = z.object({
  category: z.enum(["general", "faq", "policy", "product"]).default("general"),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(4000),
  isActive: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = knowledgeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await prisma.knowledgeEntry.create({ data: parsed.data });
  return NextResponse.json(entry, { status: 201 });
}
