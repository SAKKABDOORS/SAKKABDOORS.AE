import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";
import { journalEntryInputSchema, isBalanced, formatEntryNumber } from "@/lib/journalEntries";

export async function GET() {
  const { response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const entries = await prisma.journalEntry.findMany({
    include: { lines: { include: { account: true }, orderBy: { position: "asc" } } },
    orderBy: { entryNumber: "desc" }
  });
  return NextResponse.json(entries);
}

async function nextEntryNumber(): Promise<number> {
  const last = await prisma.journalEntry.findFirst({ orderBy: { entryNumber: "desc" }, select: { entryNumber: true } });
  return (last?.entryNumber ?? 0) + 1;
}

// Manual entries only here (opening balances, adjustments, corrections) —
// auto-posted entries (Phase 3) are created directly by lib/autoPosting.ts,
// not through this route, so they can attach a sourceType/sourceId.
export async function POST(request: NextRequest) {
  const { session, response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = journalEntryInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  // Never trust a client-computed balance — re-check authoritatively.
  if (!isBalanced(parsed.data.lines)) {
    return NextResponse.json({ error: "unbalanced" }, { status: 400 });
  }

  const accountIds = [...new Set(parsed.data.lines.map((l) => l.accountId))];
  const accounts = await prisma.account.findMany({ where: { id: { in: accountIds } } });
  if (accounts.length !== accountIds.length) {
    return NextResponse.json({ error: "invalid_account" }, { status: 400 });
  }

  const entryNumber = await nextEntryNumber();

  const entry = await prisma.journalEntry.create({
    data: {
      entryNumber,
      date: new Date(parsed.data.date),
      description: parsed.data.description,
      reference: parsed.data.reference || null,
      createdByEmail: session!.email,
      lines: {
        create: parsed.data.lines.map((l, i) => ({
          accountId: l.accountId,
          debit: l.debit || 0,
          credit: l.credit || 0,
          note: l.note || null,
          position: i
        }))
      }
    },
    include: { lines: { include: { account: true } } }
  });

  await logAudit(session!.email, "create", "JournalEntry", entry.id, `إضافة قيد #${formatEntryNumber(entry.entryNumber)}: ${entry.description}`);
  return NextResponse.json(entry, { status: 201 });
}
