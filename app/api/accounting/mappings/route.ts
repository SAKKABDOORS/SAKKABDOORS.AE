import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

export async function GET() {
  const { response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const mappings = await prisma.categoryAccountMapping.findMany({
    include: { account: true },
    orderBy: { category: "asc" }
  });
  return NextResponse.json(mappings);
}

const mappingSchema = z.object({
  category: z.string().min(1).max(100),
  accountId: z.string().min(1)
});

// Upsert on category — setting a mapping for a category that already has
// one just updates the target account (see lib/autoPosting.ts's
// resolveCategoryAccount, which reads this table first before falling back
// to the built-in defaults/Suspense).
export async function POST(request: NextRequest) {
  const { session, response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = mappingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const mapping = await prisma.categoryAccountMapping.upsert({
    where: { category: parsed.data.category },
    update: { accountId: parsed.data.accountId },
    create: { category: parsed.data.category, accountId: parsed.data.accountId },
    include: { account: true }
  });

  await logAudit(session!.email, "create", "CategoryAccountMapping", mapping.id, `ربط تصنيف "${mapping.category}" بحساب ${mapping.account.code}`);
  return NextResponse.json(mapping, { status: 201 });
}
