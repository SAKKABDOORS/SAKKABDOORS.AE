import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";
import { accountInputSchema } from "@/lib/accounts";

export async function GET() {
  const { response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const accounts = await prisma.account.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json(accounts);
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = accountInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.account.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return NextResponse.json({ error: "code_taken" }, { status: 409 });
  }

  const { parentId, ...rest } = parsed.data;
  const account = await prisma.account.create({
    data: { ...rest, parentId: parentId || undefined }
  });

  await logAudit(session!.email, "create", "Account", account.id, `إضافة حساب: ${account.code} — ${account.nameAr}`);
  return NextResponse.json(account, { status: 201 });
}
