import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

// Admin-internal only (no storefront consumer) — unlike Jobs/Products, which
// also have a public GET for the storefront to read.
export async function GET() {
  const { response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  const customerTypes = await prisma.customerType.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(customerTypes);
}

const customerTypeSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  discountPercent: z.number().min(0).max(100),
  isActive: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = customerTypeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const customerType = await prisma.customerType.create({ data: parsed.data });
  return NextResponse.json(customerType, { status: 201 });
}
