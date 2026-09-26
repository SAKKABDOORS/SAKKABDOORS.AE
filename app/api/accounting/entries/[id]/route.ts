import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";
import { formatEntryNumber } from "@/lib/journalEntries";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const entry = await prisma.journalEntry.findUnique({
    where: { id: params.id },
    include: { lines: { include: { account: true }, orderBy: { position: "asc" } } }
  });
  if (!entry) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(entry);
}

// No PATCH — entries are immutable once created, matching the Quote/Invoice
// snapshot philosophy already used elsewhere in this codebase. Corrections
// are made by deleting and re-entering (an auto-posted entry, Phase 3, is
// instead reversed automatically when its source Invoice/Payment is
// deleted — see lib/autoPosting.ts).
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const entry = await prisma.journalEntry.delete({ where: { id: params.id } }).catch(() => null);
  if (!entry) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await logAudit(session!.email, "delete", "JournalEntry", entry.id, `حذف قيد #${formatEntryNumber(entry.entryNumber)}: ${entry.description}`);
  return NextResponse.json({ ok: true });
}
