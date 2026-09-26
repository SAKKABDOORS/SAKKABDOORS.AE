import { NextRequest, NextResponse } from "next/server";
import { requireSystemUser } from "@/lib/systemApi";
import { toCsv } from "@/lib/csv";
import { getAccountBalances } from "@/lib/accountingReports";

function firstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function GET(request: NextRequest) {
  const { response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const toParam = request.nextUrl.searchParams.get("to");
  const fromParam = request.nextUrl.searchParams.get("from");
  const to = toParam ? new Date(toParam) : new Date();
  const from = fromParam ? new Date(fromParam) : firstOfMonth(to);

  const rows = await getAccountBalances({ from, to, types: ["INCOME", "EXPENSE"], includeZero: false });
  const income = rows.filter((r) => r.type === "INCOME");
  const expense = rows.filter((r) => r.type === "EXPENSE");
  const totalIncome = income.reduce((sum, r) => sum + r.balance, 0);
  const totalExpense = expense.reduce((sum, r) => sum + r.balance, 0);

  const csvRows: (string | number)[][] = [
    ["الإيرادات", ""],
    ...income.map((r) => [`${r.code} — ${r.nameAr}`, r.balance.toFixed(2)]),
    ["إجمالي الإيرادات", totalIncome.toFixed(2)],
    ["المصروفات", ""],
    ...expense.map((r) => [`${r.code} — ${r.nameAr}`, r.balance.toFixed(2)]),
    ["إجمالي المصروفات", totalExpense.toFixed(2)],
    ["صافي الدخل", (totalIncome - totalExpense).toFixed(2)]
  ];

  const csv = toCsv(["البند", "المبلغ"], csvRows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="income-statement-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}.csv"`
    }
  });
}
