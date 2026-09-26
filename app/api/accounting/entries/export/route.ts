import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { toCsv } from "@/lib/csv";
import { formatEntryNumber } from "@/lib/journalEntries";

export async function GET() {
  const { response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const entries = await prisma.journalEntry.findMany({
    include: { lines: { include: { account: true }, orderBy: { position: "asc" } } },
    orderBy: { entryNumber: "asc" }
  });

  const rows: (string | number)[][] = [];
  for (const entry of entries) {
    for (const line of entry.lines) {
      rows.push([
        formatEntryNumber(entry.entryNumber),
        entry.date.toISOString().slice(0, 10),
        entry.description,
        entry.sourceType ?? "يدوي",
        `${line.account.code} — ${line.account.nameAr}`,
        line.debit > 0 ? line.debit.toFixed(2) : "",
        line.credit > 0 ? line.credit.toFixed(2) : ""
      ]);
    }
  }

  const csv = toCsv(["رقم القيد", "التاريخ", "الوصف", "المصدر", "الحساب", "مدين", "دائن"], rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="journal-entries-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
