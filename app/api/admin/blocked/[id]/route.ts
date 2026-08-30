import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

// Deliberately narrower than the page-level RBAC (which is per-role): the
// user explicitly wants only this one account able to lift a chat block,
// not "whoever happens to hold SUPER_ADMIN" — checked here independently of
// the client, which only hides the button rather than enforcing anything.
const UNBLOCK_USERNAME = "DARKSHAM";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  if (session.username !== UNBLOCK_USERNAME) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await prisma.blockedVisitor.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
