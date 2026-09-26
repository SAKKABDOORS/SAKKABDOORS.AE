import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { toCsv } from "@/lib/csv";
import { normalBalanceFor } from "@/lib/accounts";
import { formatEntryNumber } from "@/lib/journalEntries";

export async function GET(request: NextRequest) {
  const { response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const accountId = request.nextUrl.searchParams.get("accountId");
  if (!accountId) {
    return NextResponse.json({ error: "missing_account_id" }, { status: 400 });
  }

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const lines = await prisma.journalEntryLine.findMany({
    where: { accountId },
    include: { journalEntry: true },
    orderBy: { journalEntry: { date: "asc" } }
  });

  let runningBalance = 0;
  const rows = lines.map((line) => {
    runningBalance += normalBalanceFor(account.type, line.debit, line.credit);
    return [
      line.journalEntry.date.toISOString().slice(0, 10),
      formatEntryNumber(line.journalEntry.entryNumber),
      line.journalEntry.description,
      line.debit > 0 ? line.debit.toFixed(2) : "",
      line.credit > 0 ? line.credit.toFixed(2) : "",
      runningBalance.toFixed(2)
    ];
  });

  const csv = toCsv(["التاريخ", "رقم القيد", "الوصف", "مدين", "دائن", "الرصيد"], rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ledger-${account.code}-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
