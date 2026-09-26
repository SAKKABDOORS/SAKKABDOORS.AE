import { NextResponse } from "next/server";
import { requireSystemUser } from "@/lib/systemApi";
import { toCsv } from "@/lib/csv";
import { getAccountBalances } from "@/lib/accountingReports";
import { ACCOUNT_TYPE_LABELS } from "@/lib/accounts";

export async function GET() {
  const { response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const balances = await getAccountBalances({ includeZero: false });

  const csv = toCsv(
    ["الرمز", "الحساب", "النوع", "مدين", "دائن"],
    balances.map((b) => [b.code, b.nameAr, ACCOUNT_TYPE_LABELS[b.type], b.totalDebit.toFixed(2), b.totalCredit.toFixed(2)])
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="trial-balance-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
