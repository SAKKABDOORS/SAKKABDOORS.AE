import { NextRequest, NextResponse } from "next/server";
import { requireSystemUser } from "@/lib/systemApi";
import { toCsv } from "@/lib/csv";
import { getAccountBalances } from "@/lib/accountingReports";

export async function GET(request: NextRequest) {
  const { response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const asOfParam = request.nextUrl.searchParams.get("asOf");
  const asOf = asOfParam ? new Date(asOfParam) : new Date();

  const [assets, liabilities, equity, incomeExpense] = await Promise.all([
    getAccountBalances({ asOf, types: ["ASSET"], includeZero: false }),
    getAccountBalances({ asOf, types: ["LIABILITY"], includeZero: false }),
    getAccountBalances({ asOf, types: ["EQUITY"], includeZero: false }),
    getAccountBalances({ asOf, types: ["INCOME", "EXPENSE"] })
  ]);

  const totalIncome = incomeExpense.filter((a) => a.type === "INCOME").reduce((sum, a) => sum + a.balance, 0);
  const totalExpense = incomeExpense.filter((a) => a.type === "EXPENSE").reduce((sum, a) => sum + a.balance, 0);
  const netIncome = totalIncome - totalExpense;

  const rows: (string | number)[][] = [];
  const addSection = (title: string, items: { code: string; nameAr: string; balance: number }[]) => {
    rows.push([title, ""]);
    for (const item of items) rows.push([`${item.code} — ${item.nameAr}`, item.balance.toFixed(2)]);
  };

  addSection("الأصول", assets);
  addSection("الالتزامات", liabilities);
  addSection("حقوق الملكية", equity);
  rows.push(["صافي الدخل حتى تاريخه", netIncome.toFixed(2)]);

  const csv = toCsv(["البند", "الرصيد"], rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="balance-sheet-${asOf.toISOString().slice(0, 10)}.csv"`
    }
  });
}
