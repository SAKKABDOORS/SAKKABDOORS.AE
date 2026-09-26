import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";
import { STARTER_CHART_OF_ACCOUNTS } from "@/lib/accounts";

// Idempotent — upserts on `code`, so it's safe to click again later (e.g.
// after a future update adds more starter accounts) without duplicating or
// overwriting anything the OWNER has already customized beyond code/type.
export async function POST() {
  const { session, response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const results = await prisma.$transaction(
    STARTER_CHART_OF_ACCOUNTS.map((a) =>
      prisma.account.upsert({
        where: { code: a.code },
        update: {},
        create: { code: a.code, nameAr: a.nameAr, nameEn: a.nameEn, type: a.type, isSystemDefault: true }
      })
    )
  );

  await logAudit(session!.email, "create", "Account", "seed-starter", `تحميل دليل الحسابات الافتراضي (${results.length} حساب)`);
  return NextResponse.json({ ok: true, count: results.length });
}
